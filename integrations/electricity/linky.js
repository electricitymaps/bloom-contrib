import moment from 'moment';
import request from 'superagent';
import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';

import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { AuthenticationError, HTTPError, ValidationError } from '../utils/errors';

const GRANULARITY = {
  day: 'urlCdcJour',
  hour: 'urlCdcHeure',
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

// TODO(olc): MERGE WITH INTERNAL UTILS LIB
function groupByReduce(arr, groupByAccessor, reduceAccessor) {
  return mapValues(
    groupBy(arr, groupByAccessor),
    reduceAccessor,
  );
}

function arrayGroupByReduce(arr, groupByAccessor, reduceAccessor) {
  return Object.values(groupByReduce(arr, groupByAccessor, reduceAccessor));
}

async function logIn(username, password, logger) {
  if (!username || !password) {
    throw new ValidationError('Missing username or password');
  }
  const res = await agent
    .post('https://espace-client-connexion.enedis.fr/auth/UI/Login')
    .type('form')
    .set('Referer', 'https://espace-client-connexion.enedis.fr/auth/UI/Login')
    .send({
      IDToken1: username,
      IDToken2: password,
      'Login.Submit': 'accéder+à+mon+compte',
      goto: 'aHR0cHM6Ly9lc3BhY2UtY2xpZW50LXBhcnRpY3VsaWVycy5lbmVkaXMuZnIvZ3JvdXAvZXNwYWNlLXBhcnRpY3VsaWVycy9hY2N1ZWls', // base64 of https://espace-client-particuliers.enedis.fr/group/espace-particuliers/accueil'
      gotoOnFail: '',
      SunQueryParamsString: 'cmVhbG09cGFydGljdWxpZXJz', // base64 of realm=particuliers
      encoded: 'true',
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
    logger.logWarning(`Response URL ${responseURL} unexpectedly contained 'Login'`);
  }
  if (responseURL.includes('messages')) {
    throw new AuthenticationError('Invalid credentials');
  }
  // if (res.text.includes('Votre session a expiré')) {
  //   throw new AuthenticationError('Session expired');
  // }

  // Try to load homepage
  const res2 = await agent
    .get('https://espace-client-connexion.enedis.fr/group/espace-particuliers/accueil');
  if (!res2.ok) {
    console.error(res2);
    throw new HTTPError('Error while loading homepage', res.status);
  }
}


async function connect(requestLogin, requestWebView, logger) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();
  await logIn(username, password, logger);

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

async function fetchActivities(frequency, startDate, endDate, logger) {
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
  if (responseURL && responseURL.includes('Login')) {
    throw new Error('We\'re supposed to be logged in at this stage');
  }

  const json = JSON.parse(res.text);
  if (json.etat.valeur === 'erreur') {
    throw new Error(`Error while fetching data. More info: ${JSON.stringify(json)}`);
  }
  if (json.etat.valeur === 'nonActive') {
    if (frequency === 'hour') {
      return fetchActivities('day', startDate, endDate, logger);
    }
    throw new Error(`No available data for the selected period. More info: ${JSON.stringify(json)}`);
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
      dateMoment: moment(startMoment)
        .add(i * STEP_GRANULARITY[frequency], frequency),
    })),
    d => moment(d.dateMoment).startOf('day').toISOString()
  ))
    // Now that values are grouped by day,
    // make sure to aggregate properly
    .map(([k, values]) => {
      // `values` might contain half hourly data
      // so it needs to be aggregated by `frequency`
      const processedValues = arrayGroupByReduce(
        values,
        d => moment(d.dateMoment).startOf(frequency).toISOString(),
        arr => arr.map(parseValue).reduce((a, b) => a + b, 0),
      );

      return {
        id: `linky${k}`,
        datetime: moment(k).toDate(),
        activityType: ACTIVITY_TYPE_ELECTRICITY,
        energyWattHours: processedValues
          .reduce((a, b) => a + b, 0),
        durationHours: processedValues.length,
        hourlyEnergyWattHours: processedValues,
      };
    })
    .filter((d) => {
      if (d.durationHours !== 24) {
        return true;
      }
      logger.logWarning(`Ignoring activity from ${d.datetime.toISOString()} with ${d.durationHours} hours instead of 24`);
      return false;
    });

  return { activities, endMoment };
}

async function collect(state, logger) {
  const { username, password } = state;
  // LogIn to set Cookies
  await logIn(username, password, logger);

  // For now we're gathering hourly data
  const frequency = 'hour';

  // By default, go back 1 month
  // (we can't go back further using a single API call)
  const startDate = state.lastFullyCollectedDay || moment().subtract(1, 'month').format('DD/MM/YYYY');
  const endDate = moment().format('DD/MM/YYYY');

  const { activities, endMoment } = await fetchActivities(frequency, startDate, endDate, logger);

  // Subtract one day to make sure we always have a full day
  const lastFullyCollectedDay = endMoment.subtract(1, 'day').format('DD/MM/YYYY');

  return { activities, state: { ...state, lastFullyCollectedDay } };
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
