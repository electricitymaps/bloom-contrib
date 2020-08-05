import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_CAR } from '../../definitions';

import env from '../loadEnv';
import { OAuth2Manager } from '../authentication';
import { HTTPError } from '../utils/errors';

const manager = new OAuth2Manager({
  accessTokenUrl: 'https://login.uber.com/oauth/v2/token',
  authorizeUrl: 'https://login.uber.com/oauth/v2/authorize',
  baseUrl: 'https://api.uber.com',
  clientId: env.UBER_CLIENT_ID,
  clientSecret: env.UBER_CLIENT_SECRET,
});

const MILES_TO_KM = 1.60934;
const HISTORY_API_FETCH_LIMIT = 50;

async function connect(requestLogin, requestToken, requestWebView, logger) {
  const state = await manager.authorize(requestWebView, logger);
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
  const url = `/v1.2/history?limit=${HISTORY_API_FETCH_LIMIT}&offset=${offset || 0}`;
  const res = await manager.fetch(url, {}, logger);

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  const data = await res.json();
  const activities = (data.history || []).map(d => ({
    id: d.request_id, // unique id that will be used in case of de-duplication
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    carrier: 'Uber',
    datetime: new Date(d.start_time * 1000.0),
    endDatetime: d.start_time === d.end_time ? null : new Date(d.end_time * 1000.0),
    distanceKilometers: d.distance * MILES_TO_KM, // the origin in given in miles
    transportationMode: TRANSPORTATION_MODE_CAR,
    locationLon: d.start_city.longitude,
    locationLat: d.start_city.latitude,
  }));

  // Note: `data.count` is the total number of items available
  return { activities, totalCount: data.count };
}

async function collect(state, { logDebug }) {
  manager.setState(state);

  // fetch first result to check total number of rides
  const { activities: latestActivities, totalCount } = await queryActivitiesFromOffset(0, {
    logDebug,
  });
  const fetches = [];
  // return all items or the difference since last collect()
  const itemsToFetch = totalCount - (state.lastTotalCount || 0);

  // we've already done one fetch, skip first
  let fetchIndex = HISTORY_API_FETCH_LIMIT;

  while (fetchIndex < itemsToFetch) {
    fetches.push(queryActivitiesFromOffset(fetchIndex, { logDebug }));
    fetchIndex += HISTORY_API_FETCH_LIMIT;
  }

  const allResults = (await Promise.all(fetches)).reduce(
    (acc, val) => acc.concat(val.activities),
    latestActivities
  );

  // we possibly fetched too many results, only return new items
  const cappedResults = allResults.slice(0, itemsToFetch);

  return {
    activities: cappedResults,
    state: {
      ...state,
      lastTotalCount: totalCount,
    },
  };
}

const config = {
  contributors: ['willtonkin', 'corradio'],
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
