import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_CAR } from '../../definitions';
import { OAuth2Manager } from '../authentication';
import { HTTPError, AuthenticationError } from '../utils/errors';
import env from '../loadEnv';
/*
API documentation: https://developer.automatic.com/api-reference/
testing activities: https://developer.automatic.com/api-reference/#get-a-list-of-my-trips
*/

const API_FETCH_LIMIT = 10;

const manager = new OAuth2Manager({
  accessTokenUrl: 'https://accounts.automatic.com/oauth/access_token',
  authorizeUrl: 'https://accounts.automatic.com/oauth/authorize',
  baseUrl: 'https://api.automatic.com',
  clientId: env.AUTOMATIC_CLIENT_ID,
  clientSecret: env.AUTOMATIC_CLIENT_SECRET,
  scope: 'scope:public%20scope:user:profile%20scope:location%20scope:vehicle:profile%20scope:vehicle:events%20scope:trip%20scope:behavior',
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

async function fetchOffsetActivities(next, logger) {
  const tripURL = next || `/trip/?limit=${API_FETCH_LIMIT}`;
  const res = await manager.fetch(tripURL, {}, logger);

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  const data = await res.json(); 
  const activities = (data.results || []).map(k => ({
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

  // eslint-disable-next-line no-underscore-dangle
  return { activities, next: data._metadata.next };
}

async function collect(state, logger) {
  manager.setState(state);

  // return from function because if there aren't more activities to fetch, the API declares 'next' as null
  if (state.lastNext === null) {
    return {
      activities: [],
      state,
    };
  }
  const { activities, next } = await fetchOffsetActivities(state.lastNext || null, logger);

  return {
    activities,
    state: {
      ...state,
      lastNext: next,
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