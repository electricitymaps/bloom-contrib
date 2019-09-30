import moment from 'moment';
import request from 'superagent';
import groupBy from 'lodash/groupBy';

import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { AuthenticationError, HTTPError } from '../utils/errors';

const GRANULARITY = {
  day: 'urlCdcJour',
  hour: 'urlCdcHeure',
};
const DURATION_HOURS = {
  day: 24,
  hour: 1,
};
const STEP_GRANULARITY = {
  day: 1,
  hour: 0.5, // half-hourly data is given
};
const PPID = 'lincspartdisplaycdc_WAR_lincspartcdcportlet';

// Create an agent that can hold cookies
const agent = request.agent();

/*
  Doc: https://github.com/PhilBri/Node-Linky/blob/master/linky.js
  Note we can't use the same implementation as RN `fetch` uses
  XMLHttpRequest which always follows redirects, thus preventing
  us from grabbing cookies. Else we would be able to set
  .redirects(0) on `agent`.
*/

function getResponseURL(res) {
  if (res.redirects) {
    return (res.redirects || [])[0];
  }
  if (res.xhr) {
    return res.xhr.responseURL;
  }
  return null;
}

async function logIn(username, password) {
  const res = await agent
    .post('https://espace-client-connexion.enedis.fr/auth/UI/Login')
    .type('form')
    .send({
      IDToken1: username,
      IDToken2: password,
      // <--- adding this redirect seems to allow us to check that the login
      // works, else it might just redirect to an empty page..
      // goto: 'aHR0cHM6Ly9lc3BhY2UtY2xpZW50LXBhcnRpY3VsaWVycy5lbmVkaXMuZnIvZ3JvdXAvZXNwYWNlLXBhcnRpY3VsaWVycy9hY2N1ZWls', // base64 of http://espace-client-particuliers.enedis.fr:80/group/espace-particuliers/accueil'
      // gotoOnFail: '',
      SunQueryParamsString: 'cmVhbG09cGFydGljdWxpZXJz',
      encoded: true,
      gx_charset: 'UTF-8',
    });

  if (!res.ok) {
    console.error(res);
    throw new HTTPError('Error while logging in.', res.status);
  }
  // Check if redirected to https://espace-client-connexion.enedis.fr/messages/{information,inexistant}.html
  // which indicates a login error
  const responseURL = getResponseURL(res);
  if (responseURL.includes('Login')) {
    // highly suspicious that we are redirected to the Login page.
    // we should probably be redirected somewhere else
    console.warn('loginResponseURL', responseURL);
  } else {
    console.warn('loginResponseURL', responseURL);
  }
  if (responseURL.includes('messages')) {
    throw new AuthenticationError('Invalid credentials');
  }
  // if (res.text.includes('Votre session a expiré')) {
  //   throw new AuthenticationError('Session expired');
  // }
}


async function connect(requestLogin, requestWebView) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();
  await logIn(username, password);

  // Set state to be persisted
  return {
    username,
    password,
  };
}


function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}


async function collect(state, { logWarning }) {
  const { username, password } = state;
  // LogIn to set Cookies
  await logIn(username, password);

  // For now we're gathering daily data
  const frequency = 'hour';

  // By default, go back 1 month
  // (we can't go back further using a single API call)
  const startDate = state.lastFullyCollectedDay || moment().subtract(1, 'month').format('DD/MM/YYYY');
  const endDate = moment().format('DD/MM/YYYY');

  const query = {
    p_p_col_pos: 1,
    p_p_lifecycle: 2,
    p_p_col_count: 2,
    p_p_state: 'normal',
    p_p_mode: 'view',
    p_p_cacheability: 'cacheLevelPage',
    p_p_col_id: 'column-1',
    p_p_id: PPID,
    p_p_resource_id: GRANULARITY[frequency],
  };

  const payload = {};
  payload[`_${PPID}_dateDebut`] = startDate;
  payload[`_${PPID}_dateFin`] = endDate;

  const res = await agent
    .post('https://espace-client-particuliers.enedis.fr/group/espace-particuliers/suivi-de-consommation')
    .query(query)
    .type('form')
    // Those are required to avoid the client to cache responses
    .set('Cache-Control', 'no-cache')
    .set('If-None-Match', '*')
    .send(payload);

  const responseURL = getResponseURL(res);
  // Check if the response URL is a redirect to the login page
  if (responseURL.includes('Login')) {
    throw new Error('We\'re supposed to be logged in at this stage');
  }

  const json = JSON.parse(res.text);
  if (json.etat.valeur === 'erreur') {
    throw new Error('Error while fetching data.');
  }
  if (json.etat.valeur === 'nonActive') {
    throw new Error('No available data for the selected period');
  }

  const { data, periode } = json.graphe;
  const offset = json.graphe.decalage || 0;

  if (!Array.isArray(data)) {
    throw new Error(`Unexpected data: ${JSON.stringify(json)}`);
  }

  // TODO: Double check timezones?
  const startMoment = moment(periode.dateDebut, 'DD/MM/YYYY');
  const endMoment = moment(periode.dateFin, 'DD/MM/YYYY');

  // Taken from https://github.com/bokub/linky/blob/master/index.js#L156-L183
  data.splice(0, offset);
  data.splice(-offset, offset);

  /*
    Schema:
    data = [
      {"ordre": 1066, "valeur": 2.206}
      ...
    ]
    `ordre` is an index
    `valeur` is in kWh
    Negative `valeur` means data is unknown
  */

  const parseValue = d => (d.valeur >= 0 ? d.valeur * 1000 : 0);

  const activities = Object.entries(groupBy(
    data.map((d, i) => Object.assign(d, {
      date: moment(startMoment)
        .add(i * STEP_GRANULARITY[frequency], frequency)
        .startOf('day')
        .toISOString(),
    })),
    d => d.date
  ))
    .map(([k, values]) => ({
      id: `linky${k}`,
      datetime: moment(k).toDate(),
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: values
        .map(parseValue) // kWh -> Wh
        .reduce((a, b) => a + b, 0),
      durationHours: values.length,
      hourlyEnergyWattHours: values.map(parseValue),
    }));
  activities
    .filter(d => d.durationHours !== 24)
    .forEach(d => logWarning(`Ignoring activity from ${d.datetime.toISOString()} with ${d.durationHours} hours instead of 24`));

  // Subtract one day to make sure we always have a full day
  const lastFullyCollectedDay = endMoment.subtract(1, 'day').format('DD/MM/YYYY');

  return { activities, state: { lastFullyCollectedDay } };
}


const config = {
  label: 'Linky',
  country: 'FR',
  description: 'collects electricity data from your smart meter',
  type: ACTIVITY_TYPE_ELECTRICITY,
  isPrivate: true,
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
