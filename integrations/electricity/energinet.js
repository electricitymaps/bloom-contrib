import request from 'superagent';
import moment from 'moment';
import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { HTTPError, ValidationError } from '../utils/errors';

const BASE_URL = 'https://api.eloverblik.dk/CustomerApi/api';
const TOKEN_URL = `${BASE_URL}/Token`;
const METER_POINTS_URL = `${BASE_URL}/MeteringPoints/MeteringPoints?includeAll=false`;
const TIME_SERIES_URL = `${BASE_URL}/MeterData/GetTimeSeries/{dateFrom}/{dateTo}/{aggregation}`;

const AGGREGATION = 'Day';
const DATE_FORMAT = 'YYYY-MM-DD';

async function getAccessToken(refreshToken) {
  const res = await request.get(TOKEN_URL).set('Authorization', `Bearer ${refreshToken}`);
  if (!res.ok) {
    throw new HTTPError(res.text, res.status);
  }

  return res.body.result;
}

async function getMeteringPoints(accessToken) {
  const res = await request.get(METER_POINTS_URL).set('Authorization', `Bearer ${accessToken}`);
  if (!res.ok) {
    throw new HTTPError(res.text, res.status);
  }

  const meterPointIds = res.body.result.map(meterPointInfo => meterPointInfo.meteringPointId);
  return meterPointIds;
}

async function getTimeSeries(accessToken, meterPointIds) {
  const now = moment();
  const url = TIME_SERIES_URL.replace('{dateFrom}', now.subtract(3, 'days').format(DATE_FORMAT))
    .replace('{dateTo}', now.subtract(2, 'days').format(DATE_FORMAT))
    .replace('{aggregation}', AGGREGATION);
  const bodyMeterPoints = {
    meteringPoints: {
      meteringPoint: meterPointIds,
    },
  };
  const res = await request
    .post(url)
    .send(bodyMeterPoints)
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Content-Type', 'application/json');
  if (!res.ok) {
    throw new HTTPError(res.text, res.status);
  }

  return res.body
}

async function connect(requestToken) {
  const { token } = await requestToken();
  // Test that the provided token is valid and allows to fetch an access token
  const accessToken = getAccessToken(token);
  return { token };
}

async function collect(state = {}, logger) {
  const { refreshToken } = state;
  const accessToken = getAccessToken(refreshToken);
  const meterPointIds = getMeteringPoints(accessToken);
  const timeSeries = getTimeSeries(accessToken, meterPointIds);

  const activity = {
    id, // a string that uniquely represents this activity
    datetime, // a javascript Date object that represents the start of the activity
    endDatetime, // a javascript Date object that represents the end of the activity. If the activity has no duration, set to "null"
    activityType: ACTIVITY_TYPE_ELECTRICITY,
    energyWattHours, // a float that represents the total energy used
    hourlyEnergyWattHours, // (optional) an array of 24 floats that represent the hourly metering values
    locationLon, // (optional) the longitude of the location of the electricity usage
    locationLat, // (optional) the latitude of the location of the electricity usage
  };
  return { activities, state: newState };
}
async function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

const config = {
  description: 'collects electricity data from your smart meter',
  label: 'Energinet',
  country: 'DK',
  isPrivate: true,
  type: ACTIVITY_TYPE_ELECTRICITY,
  signupLink: 'https://eloverblik.dk/Customer/login/',
  contributors: ['pierresegonne'],
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
