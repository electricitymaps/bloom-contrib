import moment from 'moment';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_CAR } from '../../definitions';
import { OAuth2Manager } from '../authentication';
import { HTTPError } from '../utils/errors';
import env from '../loadEnv';
/*
API documentation: https://developer.automatic.com/api-reference/
testing activities: https://developer.automatic.com/api-reference/#get-a-list-of-my-trips
*/

const API_FETCH_LIMIT = 50;

const manager = new OAuth2Manager({
  accessTokenUrl: 'https://accounts.automatic.com/oauth/access_token',
  authorizeUrl: 'https://accounts.automatic.com/oauth/authorize',
  baseUrl: 'https://api.automatic.com',
  clientId: env.AUTOMATIC_CLIENT_ID,
  clientSecret: env.AUTOMATIC_CLIENT_SECRET,
  scope: '&scope=scope:public%20scope:user:profile%20scope:location%20scope:vehicle:profile%20scope:vehicle:events%20scope:trip%20scope:behavior',
});

async function connect(requestLogin, requestWebView) {
  const state = await manager.authorize(requestWebView);
  return state;
}

async function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  await manager.deauthorize();
  return {};
}

const toUnixSeconds = ISOdate => moment(ISOdate).format('X');

async function fetchTripsFromURL(tripURL, logger) {
  const res = await manager.fetch(tripURL, {}, logger);

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  const data = await res.json(); 
  return data;
}

const toActivities = tripArray => (tripArray || []).map(k => ({
  id: k.id,
  activityType: ACTIVITY_TYPE_TRANSPORTATION,
  datetime: new Date(k.started_at),
  vehicle: k.vehicle,
  durationHours: (Math.round(k.duration_s) / 3600).toFixed(2),
  distanceKilometers: k.distance_m / 1000,
  transportationMode: TRANSPORTATION_MODE_CAR,
  startLat: k.start_location.lat,
  startLon: k.start_location.lon,
  endLat: k.end_location.lat,
  endLon: k.end_location.lon,
}));

async function fetchOffsetActivities(start, end, logger) {
  const startDateString = start === null ? '' : `started_at_gte=${toUnixSeconds(start)}&`;
  const tripURL = `/trip/?${startDateString}ended_at__lte=${toUnixSeconds(end)}&limit=${API_FETCH_LIMIT}`;

  // fetching first batch to check the number of trips
  let data = await fetchTripsFromURL(tripURL, logger);

  const trips = [];
  const latestTrips = data.results;
  const tripCount = data._metadata.count;
  let nextURL = data._metadata.next;

  toActivities(latestTrips).map(a => trips.push(a));

  // safety counter
  let counter = API_FETCH_LIMIT;

  while (nextURL && counter < tripCount) {
    data = await fetchTripsFromURL(nextURL, logger);
    toActivities(data.results).map(a => trips.push(a));
    nextURL = data._metadata.next;
    counter += API_FETCH_LIMIT;
  }
  
  const allResults = await Promise.all(trips);

  return allResults;
}

async function collect(state, logger) {
  manager.setState(state);

  const startDate = state.lastFullyCollectedDay;
  const endDate = moment().toISOString();
  const activities = await fetchOffsetActivities(startDate || null, endDate, logger);
  const lastFullyCollectedDay = endDate;

  return {
    activities,
    state: {
      ...state,
      lastFullyCollectedDay,
    },
  };
}

const config = {
  label: 'Automatic',
  description: 'collects data from your car rides',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  isPrivate: true,
  contributors: ['lauvrenn'],
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
