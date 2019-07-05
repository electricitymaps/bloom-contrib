import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_CAR } from '../../definitions';

import env from '../loadEnv';
import { OAuth2Manager } from '../authentication';

const manager = new OAuth2Manager({
  accessTokenUrl: 'https://login.uber.com/oauth/v2/token',
  authorizeUrl: 'https://login.uber.com/oauth/v2/authorize',
  baseUrl: 'https://api.uber.com',
  clientId: env.UBER_CLIENT_ID,
  clientSecret: env.UBER_CLIENT_SECRET,
});

const MILES_TO_KM = 1.60934;

async function connect(requestLogin, requestWebView) {
  const state = await manager.authorize(requestWebView);
  return state;
}

async function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  await manager.deauthorize();
  return {};
}

async function queryActivitiesFromOffset(offset, logger) {
  /*
  API Documentation at https://developer.uber.com/docs/riders/references/api/v1.2/history-get
  */
  const url = `/v1.2/history?limit=50&offset=${offset || 0}`;
  const res = await manager.fetch(url, {}, logger);

  if (!res.ok) {
    const text = await res.text();
    // throw new HTTPError(text, res.status);
    throw new Error(`HTTP error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const activities = (data.history || []).map(d => ({
    id: d.request_id, // unique id that will be used in case of de-duplication
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    carrier: 'Uber',
    datetime: new Date(d.start_time * 1000.0),
    distanceKilometers: d.distance * MILES_TO_KM, // the origin in given in miles
    durationHours: (new Date(d.end_time * 1000.0) - new Date(d.start_time * 1000.0)) / 1000.0 / 3600.0,
    transportationMode: TRANSPORTATION_MODE_CAR,
    locationLon: d.start_city.longitude,
    locationLat: d.start_city.latitude,
  }));

  // Note: `data.count` is the total number of items available
  return { activities, totalCount: data.count, limit: 50 };
}

async function collect(state, { logDebug }) {
  const allActivities = [];
  let numItemsFetched = 0;
  let nextOffset = 0;
  let hasMore;
  do {
    const { activities, totalCount, limit } = await queryActivitiesFromOffset(nextOffset, { logDebug });
    activities.forEach(d => allActivities.push(d));
    numItemsFetched += activities.length;

    // Query results are given from most recent to least.
    // `totalCount` represents the total number of rides available in the API
    if (totalCount - numItemsFetched > 0) {
      // There's still items to fetch!
      nextOffset += limit;
      hasMore = true;
      logDebug(`hasMore=true, nextOffset=${nextOffset}`);
    } else {
      hasMore = false;
    }
  } while (hasMore);

  return {
    activities: allActivities,
    state: {},
  };
}

const config = {
  label: 'Uber',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  isPrivate: true,
  description: 'collects your Uber rides',
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
