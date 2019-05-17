import { Buffer } from 'buffer';
import moment from 'moment';

import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';

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
    // throw new HTTPError(text, res.status);
    throw new Error(`HTTP error ${res.status}: ${text}`);
  }
  const response = await res.json();
  if (response.error) {
    const { exception, message, stacktrace } = response.error.data;
    if (exception === 'java.lang.SecurityException') {
      // Access denied
      throw new Error('Invalid username or password');
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
  return request(username, password, 'co.getbarry.megatron.controller.UserController.get', [username]);
}
async function getMeteringPointAssociated(username, password, customerId) {
  return request(username, password, 'co.getbarry.megatron.controller.MeteringPointAssociationController.findByCustomerId', [customerId]);
}
async function getRegion(username, password, meteringPointId) {
  return request(username, password, 'co.getbarry.megatron.controller.PriceController.getRegion', [meteringPointId]);
}
async function getMeterTimeSeries(username, password, meteringPointId, fromISO, toISO) {
  return request(username, password, 'co.getbarry.megatron.controller.MeteredDataTimeSeriesController.findAllLatestByMeteringPointId', [meteringPointId, fromISO, toISO]);
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
  };
}


function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state, { logWarning }) {
  const {
    username, password, meteringPointId, priceRegion,
  } = state;

  const response = await getMeterTimeSeries(
    username, password, meteringPointId,
    // Make sure to pass UTC times
    // TODO(olc): right now, Barry API ignores input datetime
    new Date('2019-05-01').toISOString(),
    new Date('2019-05-15').toISOString()
  );

  // Note: some entries contain more than 24 values.
  // that's because they cover several days
  // we need to separate those manually

  const { locationLon, locationLat } = REGION_TO_LOCATION[priceRegion];

  const activities = response.map(d => ({
    id: `barry${d.id}`,
    datetime: moment(d.start).toDate(),
    activityType: ACTIVITY_TYPE_ELECTRICITY,
    energyWattHours: d.intervalEnergyObservations
      .map(x => x.energyQuantity * 1000.0) // kWh -> Wh
      .reduce((a, b) => a + b, 0),
    durationHours: d.intervalEnergyObservations.length,
    locationLon,
    locationLat,
  }));
  activities
    .filter(d => d.durationHours !== 24)
    .forEach(d => logWarning(`Ignoring activity with ${d.durationHours} hours instead of 24`));

  return { activities: activities.filter(d => d.durationHours === 24), state };
}

const config = {
  description: 'collects electricity data from your smart meter',
  label: 'Barry',
  country: 'DK',
  isPrivate: true,
  type: ACTIVITY_TYPE_ELECTRICITY,
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
