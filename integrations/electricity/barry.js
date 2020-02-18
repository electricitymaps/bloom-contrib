import { Buffer } from 'buffer';
import moment from 'moment';
import groupBy from 'lodash/groupBy';

import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { AuthenticationError, HTTPError } from '../utils/errors';

const btoa = b => Buffer.from(b).toString('base64');

const REGION_TO_LOCATION = {
  DK1: {
    locationLat: 55.927443,
    locationLon: 9.248319,
  },
  DK2: {
    locationLat: 55.582066,
    locationLon: 11.920338,
  },
};

let id = 0;

async function request(username, password, method, params) {
  id += 1;
  const req = {
    method: 'POST',
    body: JSON.stringify({
      params,
      method,
      jsonrpc: '2.0',
      id,
    }),
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      'Content-Type': 'application/json',
    },
  };
  const res = await fetch('https://jsonrpc.getbarry.dk/json-rpc', req);
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }
  const response = await res.json();
  if (response.error) {
    const { exception, message, stacktrace } = response.error.data;
    if (exception === 'java.lang.SecurityException') {
      // Access denied
      throw new AuthenticationError('Invalid username or password');
    } else {
      throw new Error(`${exception}: ${message}`);
    }
  }
  return response.result;
}

async function getUser(username, password) {
  if (!(password || '').length) {
    throw Error('Password cannot be empty');
  }
  return request(username, password, 'co.getbarry.megatron.controller.UserController.get', []);
}
async function getMeteringPointAssociated(username, password, customerId) {
  return request(
    username,
    password,
    'co.getbarry.megatron.controller.MeteringPointAssociationController.findByCustomerId',
    [customerId]
  );
}
async function getRegion(username, password, meteringPointId) {
  return request(username, password, 'co.getbarry.megatron.controller.PriceController.getRegion', [
    meteringPointId,
  ]);
}
async function getHourlyConsumption(
  username,
  password,
  customerId,
  meteringPointId,
  fromISO,
  toISO
) {
  return request(
    username,
    password,
    'co.getbarry.megatron.controller.ConsumptionController.getHourlyConsumption',
    [customerId, [meteringPointId], fromISO, toISO]
  );
}

async function connect(requestLogin, requestWebView) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();

  // Try to login
  const { customerId } = await getUser(username, password);
  const associatedMeteringPoints = await getMeteringPointAssociated(username, password, customerId);

  if (!associatedMeteringPoints.length) {
    throw new Error('No associated metering point found');
  }

  const meteringPointId = associatedMeteringPoints[0].mpid;
  const priceRegion = await getRegion(meteringPointId);

  // Set state to be persisted
  return {
    username,
    password,
    meteringPointId,
    priceRegion,
    customerId,
  };
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state, { logWarning }) {
  const { username, password, meteringPointId, priceRegion } = state;

  // Try to see if customerId was present in state
  // (in older version it wasn't)
  const customerId = state.customerId || (await getUser(username, password)).customerId;

  const startDate =
    state.lastFullyCollectedDay ||
    moment()
      .subtract(1, 'month')
      .toISOString();
  const endDate = moment().toISOString();

  const response = await getHourlyConsumption(
    username,
    password,
    customerId,
    meteringPointId,
    startDate,
    endDate
  );

  // Note: some entries contain more than 24 values.
  // that's because they cover several days
  // we need to separate those manually

  const { locationLon, locationLat } = REGION_TO_LOCATION[priceRegion];

  /*
    Note: right now days are defined as UTC days.
    We should probably use local time to define days
  */

  const activities = Object.entries(
    groupBy(response, d =>
      moment(d.date)
        .startOf('day')
        .toISOString()
    )
  ).map(([k, values]) => ({
    id: `barry${k}`,
    datetime: moment(k).toDate(),
    activityType: ACTIVITY_TYPE_ELECTRICITY,
    energyWattHours: values
      .map(x => x.value * 1000.0) // kWh -> Wh
      .reduce((a, b) => a + b, 0),
    durationHours: values.length,
    hourlyEnergyWattHours: values.map(x => x.value * 1000.0),
    locationLon,
    locationLat,
  }));
  activities
    .filter(d => d.durationHours !== 24)
    .forEach(d =>
      logWarning(
        `Ignoring activity from ${d.datetime.toISOString()} with ${
          d.durationHours
        } hours instead of 24`
      )
    );

  if (!activities.length) {
    return { activities: [] };
  }

  // Subtract one day to make sure we always have a full day
  const lastFullyCollectedDay = moment(activities[activities.length - 1].datetime)
    .subtract(1, 'day')
    .toISOString();

  return {
    activities: activities.filter(d => d.durationHours === 24),
    state: { ...state, customerId, lastFullyCollectedDay },
  };
}

const config = {
  description: 'collects electricity data from your smart meter',
  label: 'Barry',
  country: 'DK',
  isPrivate: true,
  type: ACTIVITY_TYPE_ELECTRICITY,
  signupLink: 'https://getbarry.page.link/download-barry',
  contributors: ['corradio'],
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
