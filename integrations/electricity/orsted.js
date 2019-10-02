/* eslint-disable camelcase */
import request from 'superagent';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { AuthenticationError, HTTPError, ValidationError } from '../utils/errors';
import { cityToLonLat } from '../utils/location';

const LOGIN_URL = 'https://api.obviux.dk/v2/authenticate';
const DELIVERIES_URL = 'https://api.obviux.dk/v2/deliveries';
const METER_POINTS_URL = 'https://capi.obviux.dk/v1/consumption/customer/{external_id}/ean/{ean}/hourly';

const CUSTOMER_IP = '127.0.0.1';
const DATE_FORMAT = 'YYYY-MM-DD';

async function login(username, password) {
  const res = await request
    .post(LOGIN_URL)
    .send({ customer: username, password })
    .set('X-Customer-Ip', CUSTOMER_IP);
  if (!res.ok) {
    throw new HTTPError(res.text, res.status);
  }

  return res.body;
}

async function getUsersElectricityId(token) {
  const res = await request
    .get(DELIVERIES_URL)
    .set('Authorization', token)
    .set('X-Customer-Ip', CUSTOMER_IP);

  if (!res.ok) {
    throw new HTTPError(res.text, res.status);
  }

  const electricityDelivery = res.body.find(d => d.type === 'electrical');
  if (!electricityDelivery) {
    throw new ValidationError(
      'User does not have an electricity service connected to their orsted account'
    );
  }
  return electricityDelivery.ean;
}

async function getMeteringPoints(token, ean, external_id, lastCollect) {
  if (lastCollect.add(1, 'hour').isAfter(moment())) {
    return [];
  }

  const endDate = moment.min(lastCollect.clone().add(14, 'days'), moment());
  const url = METER_POINTS_URL.replace('{external_id}', external_id).replace('{ean}', ean);

  const res = await request
    .get(url)
    .query({
      from: lastCollect.format(DATE_FORMAT),
      to: endDate.format(DATE_FORMAT),
    })
    .set('Authorization', token)
    .set('X-Customer-Ip', CUSTOMER_IP);

  if (!res.ok) {
    throw new HTTPError(res.text, res.status);
  }

  return res.body.data[0].consumptions.concat(
    await getMeteringPoints(token, ean, external_id, endDate)
  );
}

async function connect(requestLogin) {
  const { username, password } = await requestLogin();

  const { token, external_id, address } = await login(username, password);
  await getUsersElectricityId(token);
  const lonLat = await cityToLonLat('DK', address.zip_code);

  return {
    username,
    password,
    locationLon: lonLat[0],
    locationLat: lonLat[1],
  };
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state, logger) {
  const {
    username, password, locationLon, locationLat,
  } = state;

  const { token, external_id } = await login(username, password);
  const ean = await getUsersElectricityId(token);

  // Fetch from last update. If not available, then fetch data from the last 90 days.
  const lastCollect = state.lastCollect
    ? moment(state.lastCollect)
    : moment().subtract(3, 'months');

  const points = await getMeteringPoints(token, ean, external_id, lastCollect);

  const activities = Object.entries(
    groupBy(points, d => moment(d.start)
      .startOf('day')
      .toISOString())
  ).map(([k, values]) => ({
    id: `orsted${k}`,
    datetime: moment(k).toDate(),
    activityType: ACTIVITY_TYPE_ELECTRICITY,
    energyWattHours: values
      .map(x => x.kWh * 1000.0) // kWh -> Wh
      .reduce((a, b) => a + b, 0),
    durationHours: values.length,
    hourlyEnergyWattHours: values.map(x => x.kWh * 1000.0),
    locationLon,
    locationLat,
  }));

  return { activities, state: { ...state, lastCollect: new Date().toISOString() } };
}

const config = {
  description: 'collects electricity data from your smart meter',
  label: 'Ørsted',
  country: 'DK',
  isPrivate: true,
  type: ACTIVITY_TYPE_ELECTRICITY,
  signupLink: 'https://privat.orsted.dk/el/',
  contributors: ['FelixDQ'],
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
