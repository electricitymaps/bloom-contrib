/* Sense home electricity usage monitor. https://sense.com/
 *
 * Uses the "unofficial" API: https://community.sense.com/t/official-api/2848/10
 */
import moment from 'moment';

import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';

async function request(method, call, token, params) {
  var req = {
    method: method,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  };
  if (token) {
    req.headers['Authorization'] = 'Bearer ' + token
  }

  const url = 'https://api.sense.com/apiservice/api/v1/' + call +
        '?' + new URLSearchParams(params).toString();
  const res = await fetch(url, req);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP error ${res.status}: ${text}`);
  }

  const response = await res.json();
  if (response.status == 'error') {
    throw new Error(`Login failed: ${response.error_reason}`);
  }

  return response;
}


async function connect(requestLogin, requestWebView) {
  const { username, password } = await requestLogin();

  if (!(password || '').length) {
    throw Error('Password cannot be empty');
  }

  const response = await request('POST', 'authenticate', null, {
    email: username,
    password: password,
  })

  // Set state to be persisted
  const token = response.access_token;
  const user = response.user_id;
  const monitor = response.monitors[0].id;
  return {
    token,
    user,
    monitor,
  };
}


function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}


async function collect(state, { logWarning }) {
  const {token, user, monitor} = state;

  const start = moment().startOf('day').subtract(1, 'day');
  const response = await request('GET', 'app/history/trends', token, {
    monitor_id: monitor,
    device_id: 'usage',
    scale: 'day',
    start: start.toISOString(),
  })

  const kwhs = response.consumption.totals;
  const whs = kwhs.map(kwh => kwh * 1000.0);
  return {
    activities: [{
      id: `sense-${monitor}-${start.toISOString()}`,
      datetime: start.toDate(),
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: whs.reduce((a, b) => a + b, 0),
      durationHours: whs.length,
      hourlyEnergyWattHours: whs,
    }],
    state: state,
  };
}

const config = {
  description: 'collects electricity usage from your Sense device',
  label: 'Sense',
  // Sense is currently in US and CA as of June 2019.
  // https://help.sense.com/hc/en-us#article-205775488
  // TODO: change this to ['US', 'CA'] if/when it supports multiple values.
  country: 'US',
  isPrivate: true,
  type: ACTIVITY_TYPE_ELECTRICITY,
  signupLink: 'https://sense.com/',
  contributors: ['snarfed'],
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
