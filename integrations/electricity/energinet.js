import request from 'superagent';
import moment from 'moment';
import flattenDeep from 'lodash/flattenDeep';
import groupBy from 'lodash/groupBy';
import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { HTTPError } from '../utils/errors';
import { cityToLonLat } from '../utils/location';

const BASE_URL = 'https://api.eloverblik.dk/CustomerApi/api';
const TOKEN_URL = `${BASE_URL}/Token`;
const METER_POINTS_URL = `${BASE_URL}/MeteringPoints/MeteringPoints?includeAll=false`;
const TIME_SERIES_URL = `${BASE_URL}/MeterData/GetTimeSeries/{dateFrom}/{dateTo}/{aggregation}`;

const AGGREGATION = 'Hour';
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
  const meterPointAddresses = res.body.result.map(meterPointInfo => ({
    buildingNumber: meterPointInfo.buildingNumber,
    cityName: meterPointInfo.cityName,
    postcode: meterPointInfo.postcode,
    streetCode: meterPointInfo.streetCode,
    streetName: meterPointInfo.streetName,
  }));
  return {
    meterPointIds,
    meterPointAddresses,
  };
}

/*
  Format for a data point in the concatenated time series
  {
    datetime: String # ISO datetime format,
    value: Float,
    mRID: String # a use might have several meters associated with him
  }
*/
async function getTimeSeries(accessToken, meterPointIds, lastCollect) {
  const now = moment();
  const dateFrom = lastCollect.clone();
  // the Energinet returns bad request if dateFrom and dateTo are on same day
  if (dateFrom.isSameOrAfter(now, 'day')) {
    return [];
  }
  const dateTo = moment.min(lastCollect.clone().add(14, 'days'), now);
  const url = TIME_SERIES_URL.replace('{dateFrom}', dateFrom.format(DATE_FORMAT))
    .replace('{dateTo}', dateTo.format(DATE_FORMAT))
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

  const timeSeries = flattenDeep(
    res.body.result[0].MyEnergyData_MarketDocument.TimeSeries.map(meteringPoint => {
      const { mRID } = meteringPoint;
      return meteringPoint.Period.map(period => {
        const periodStart = period.timeInterval.start;
        return period.Point.map(periodPoint => {
          return {
            datetime: moment(periodStart)
              .clone()
              .add(parseInt(periodPoint.position, 10) - 1, 'hours')
              .toISOString(),
            value: parseFloat(periodPoint['out_Quantity.quantity']),
            mRID,
          };
        });
      });
    })
  );

  return timeSeries.concat(await getTimeSeries(accessToken, meterPointIds, dateTo));
}

async function connect({ requestToken }, logger) {
  const { token } = await requestToken();
  // Test that the provided token is valid and allows to fetch an access token
  // Test of all requests used for collect
  const accessToken = await getAccessToken(token);
  const { meterPointIds, meterPointAddresses } = await getMeteringPoints(accessToken);
  const timeSeries = await getTimeSeries(accessToken, meterPointIds, moment().subtract(3, 'days'));

  // Take first meter point as reference for address
  let lonLat = [null, null];
  if (meterPointAddresses.length > 0) {
    lonLat = await cityToLonLat('DK', meterPointAddresses[0].postcode);
  }

  return {
    authToken: token,
    locationLon: lonLat[0],
    locationLat: lonLat[1],
  };
}

async function collect(state, logger) {
  const { authToken, locationLon, locationLat } = state;
  const accessToken = await getAccessToken(authToken);
  const { meterPointIds, meterPointAddresses } = await getMeteringPoints(accessToken);

  // Fetch from last update. If not available, then fetch data from the last year.
  const lastCollect = state.lastCollect ? moment(state.lastCollect) : moment().subtract(1, 'years');

  const timeSeries = await getTimeSeries(accessToken, meterPointIds, lastCollect);
  const activities = Object.entries(
    groupBy(timeSeries, dataPoint =>
      moment(dataPoint.datetime)
        .startOf('day')
        .toISOString()
    ) // regroup by day
  ).map(([k, values]) => ({
    id: `energinet${values[0].mRID}${k}`,
    datetime: moment(k).toDate(),
    endDatetime: moment
      .max(values.map(dataPoint => moment(dataPoint.datetime)))
      .add(1, 'hours')
      .toDate(), // finish at the latest time in that day
    activityType: ACTIVITY_TYPE_ELECTRICITY,
    energyWattHours: values
      .map(x => x.value * 1000.0) // kWh -> Wh
      .reduce((a, b) => a + b, 0), // sum all values for the day + all meters
    hourlyEnergyWattHours: Object.values(
      groupBy(values, dataPoint =>
        moment(dataPoint.datetime)
          .startOf('hour')
          .toISOString()
      )
    ).map(dataPointsByDatetime =>
      dataPointsByDatetime.map(x => x.value * 1000.0).reduce((a, b) => a + b, 0)
    ),
    locationLon,
    locationLat,
  }));

  return { activities, state: { ...state, lastCollect: new Date().toISOString() } };
}
async function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

const config = {
  id: 'energinet',
  description: 'Collects electricity data from your smart meter',
  label: 'Energinet',
  country: 'DK',
  type: ACTIVITY_TYPE_ELECTRICITY,
  signupLink:
    'https://www.notion.so/tmrow/How-to-get-a-token-for-Energinet-c4cdc0e568424177892056c284f45c23',
  contributors: ['pierresegonne'],
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
