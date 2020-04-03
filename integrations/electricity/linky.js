import moment from 'moment-timezone';
import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import env from '../loadEnv';

import { OAuth2Manager } from '../authentication';
import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { getActivityDurationHours } from '../../co2eq/utils';
import { HTTPError } from '../utils/errors';

const manager = new OAuth2Manager({
  accessTokenUrl: 'https://gw.prd.api.enedis.fr/v1/oauth2/token',
  authorizeUrl: 'https://mon-compte-particulier.enedis.fr/dataconnect/v1/oauth2/authorize',
  authorizeExtraParams: {
    duration: 'P2Y', // ISO duration (https://en.wikipedia.org/wiki/ISO_8601#Durations)
  },
  baseUrl: 'https://gw.prd.api.enedis.fr',
  clientId: env.LINKY_CLIENT_ID,
  clientSecret: env.LINKY_CLIENT_SECRET,
});
// The Linky endpoint does not support receiving a custom redirect URI
const omitRedirectUri = true;

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


async function connect(requestLogin, requestWebView, logger) {
  const state = await manager.authorize(requestWebView, logger, omitRedirectUri);
  return state;
}


function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function fetchActivities(usagePointId, frequency, startDate, endDate, logger) {
  const endpoints = {
    hour: 'consumption_load_curve',
    day: 'daily_consumption',
  };
  const url = `/v4/metering_data/${endpoints[frequency]}`;
  logger.logDebug(`Fetching at frequency=${frequency}, startDate=${startDate}, endDate=${endDate}`);
  const res = await manager.fetch(
    `${url}?usage_point_id=${usagePointId}&start=${startDate}&end=${endDate}`,
    {},
    logger
  );

  if (!res.ok) {
    if (res.status === 403) {
      throw new HTTPError(res.headers.get('www-authenticate'), res.status);
    }
    if (res.status === 404) {
      // no data for this point
      if (frequency === 'hour') {
        // Try with 'day'
        logger.logDebug('Couldn\'t access hourly data. Trying with daily..');
        return fetchActivities(usagePointId, 'day', startDate, endDate, logger);
      }
    }
    throw new HTTPError(await res.text(), res.status);
  }

  const json = await res.json();

  const data = json.meter_reading;
  if (usagePointId !== data.usage_point_id) {
    throw new Error(`Unexpected usage point id ${data.usage_point_id} received. Expected ${usagePointId}`);
  }
  const unit = data.reading_type.unit;

  // Parse in French timezone instead of the phone's local timezone
  const startMoment = moment.tz(data.start, 'YYYY-MM-DD', 'Europe/Paris');
  const endMoment = moment.tz(data.end, 'YYYY-MM-DD', 'Europe/Paris');

  const parseValue = (d) => {
    if (d.value == null) { return 0; }
    // Needs to return Wh
    const v = parseFloat(d.value);
    if (unit === 'Wh') { return v; }
    if (unit === 'W') {
      // this is an average over the interval length
      const intervalLengthSeconds = moment.duration(d.interval_length).asSeconds();
      return v * (intervalLengthSeconds / 3600);
    }
    throw new Error(`Unexpected unit ${unit}`);
  };

  const activities = Object.entries(groupBy(
    data.interval_reading.map((d, i) => Object.assign({}, d, {
      dateMoment: moment.tz(d.date, 'Europe/Paris'),
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
        arr => arr
          .map(parseValue)
          .reduce((a, b) => a + b, 0),
      );

      return {
        id: `linky${k}`,
        datetime: moment(k).toDate(),
        endDatetime: moment(k).add(frequency === 'hour' ? processedValues.length : 24, 'hour').toDate(),
        activityType: ACTIVITY_TYPE_ELECTRICITY,
        energyWattHours: processedValues
          .reduce((a, b) => a + b, 0),
        hourlyEnergyWattHours: frequency === 'hour'
          ? processedValues
          : undefined,
      };
    })
    .filter((d) => {
      const durationHours = getActivityDurationHours(d);
      if (durationHours === 24) {
        return true;
      }
      logger.logWarning(`Ignoring activity from ${d.datetime.toISOString()} with ${durationHours} hours instead of 24`);
      return false;
    });

  return { activities, endMoment };
}

async function collect(state, logger) {
  const { usage_point_id: usagePointId } = state.extras || {};
  manager.setState(state);

  if (!usagePointId) {
    throw new Error('No usagePointId available. You need to reconnect the integration.');
  }

  // For now we're gathering hourly data (which will fall back to daily)
  const frequency = 'hour';

  // By default, go back 7 days
  // (we can't go back further using a single API call)
  const startDate = (state.lastFullyCollectedDay
    ? moment(state.lastFullyCollectedDay)
    : moment().subtract(7, 'day')).format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');

  const { activities, endMoment } = await fetchActivities(
    usagePointId, frequency, startDate, endDate, logger
  );

  // Subtract one day to make sure we always have a full day
  const lastFullyCollectedDay = endMoment.subtract(1, 'day').toISOString();

  return { activities, state: { ...state, lastFullyCollectedDay } };
}


const config = {
  label: 'Linky',
  country: 'FR',
  description: 'collects electricity data from your smart meter',
  type: ACTIVITY_TYPE_ELECTRICITY,
  isPrivate: true,
  signupLink: 'https://espace-client-particuliers.enedis.fr/web/espace-particuliers/creation-de-compte',
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
