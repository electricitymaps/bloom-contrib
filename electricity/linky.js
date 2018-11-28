import moment from 'moment';
import request from 'superagent';

import { ACTIVITY_TYPE_ELECTRICITY } from '../../../constants';

const GRANULARITY = {
  day: 'urlCdcJour',
  hour: 'urlCdcHeure',
};
const DURATION_HOURS = {
  day: 24,
  hour: 1,
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

async function logIn(username, password) {
  const res = await agent
    .post('https://espace-client-connexion.enedis.fr/auth/UI/Login')
    .type('form')
    .send({
      IDToken1: username,
      IDToken2: password,
      SunQueryParamsString: 'cmVhbG09cGFydGljdWxpZXJz',
    });

  if (!res.ok) {
    console.error(res);
    throw Error('Error while logging in.');
  }
  if (res.xhr.responseURL.indexOf('messages') !== -1) {
    // Redirected to https://espace-client-connexion.enedis.fr/messages/{information,inexistant}.html
    // which indicates a login error.
    throw Error('Invalid credentials');
  }
}

export async function connect(requestLogin, requestWebView) {
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

export function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

export async function collect(state) {
  const { username, password } = state;
  // LogIn to set Cookies
  await logIn(username, password);

  // For now we're gathering daily data
  const frequency = 'day';

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

  const json = JSON.parse(res.text);
  if (json.etat.valeur === 'erreur') {
    throw Error('Error while fetching data.');
  }

  const { data, periode } = json.graphe;

  // TODO: Double check timezones?
  const startMoment = moment(periode.dateDebut, 'DD/MM/YYYY');
  const endMoment = moment(periode.dateDebut, 'DD/MM/YYYY');

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

  const activities = data.map((d, i) => {
    // Remember that moment methods are mutable,
    // which means we should make a copy by wrapping in `moment()``
    const dateMoment = moment(startMoment).add(i, frequency);
    return {
      // Create a unique id to make sure data will be overwritten
      id: `linky${dateMoment.toISOString()}`,
      datetime: dateMoment.toDate(),
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: d.valeur >= 0 ? (d.valeur * 1000.0) : null,
      durationHours: DURATION_HOURS[frequency],
    };
  }).filter(d => d.energyWattHours); // we currently ignore invalid hours.

  // Subtract one day to make sure we always have a full day
  const lastFullyCollectedDay = endMoment.subtract(1, 'day').format('DD/MM/YYYY');

  return { activities, state: { lastFullyCollectedDay } };
}

export const config = {
  label: 'Linky 🇫🇷',
  description: 'collects electricity data from your smart meter',
  type: ACTIVITY_TYPE_ELECTRICITY,
  isPrivate: true,
  // minRefreshInterval: 60
};
