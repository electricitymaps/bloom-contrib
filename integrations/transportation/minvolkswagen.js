import request from 'superagent';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_CAR } from '../../definitions';
import { HTTPError } from '../utils/errors';

async function loginWithPassword(email, password, logger) {
  const res = await request
    .post('https://auth-api.connectedcars.io/auth/login/email/password')
    .set('x-organization-namespace', 'semler:minvolkswagen')
    .send({ email, password });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  return res.body.token;
}

async function loginWithDeviceToken(deviceToken, logger) {
  const res = await request
    .post('https://auth-api.connectedcars.io/auth/login/deviceToken')
    .set('x-organization-namespace', 'semler:minvolkswagen')
    .send({ deviceToken });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  return res.body.token;
}

async function registerDevice(token, logger) {
  const res = await request
    .post('https://auth-api.connectedcars.io/user/registerDevice')
    .set('x-organization-namespace', 'semler:minvolkswagen')
    .set('Authorization', `Bearer ${token}`)
    .send({
      deviceModel: 'iPhone 8',
      deviceName: 'Unknown',
    });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  return res.body.deviceToken;
}

async function getCarIds(token, userId, logger) {
  const res = await request
    .post('https://api.connectedcars.io/graphql?operationName=RootQueryType')
    .set('x-organization-namespace', 'semler:minvolkswagen')
    .set('Authorization', `Bearer ${token}`)
    .send({
      operationName: 'RootQueryType',
      variables: { userId, brands: ['volkswagen'] },
      query:
        'query RootQueryType($userId: ID!, $brands: [Brand!]) { vehicles(last: 100, activated: true, userIds: [$userId], brands: $brands) { ...Car }}fragment Car on VehiclesResult { items { id } }',
    });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  return res.body.data.vehicles.items.map(i => i.id);
}

async function getUserId(token, logger) {
  const res = await request
    .post('https://api.connectedcars.io/graphql?operationName=AccountInfo')
    .set('x-organization-namespace', 'semler:minvolkswagen')
    .set('Authorization', `Bearer ${token}`)
    .send({
      operationName: 'AccountInfo',
      query: 'query AccountInfo { viewer { id } } ',
      variables: {},
    });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  return res.body.data.viewer.id;
}

async function getTrips(token, vehicleId, lastUpdate, logger) {
  const res = await request
    .post('https://api.connectedcars.io/graphql?operationName=Trips')
    .set('x-organization-namespace', 'semler:minvolkswagen')
    .set('Authorization', `Bearer ${token}`)
    .send({
      operationName: 'Trips',
      query:
        'query Trips($vehicleId: ID!, $first: Int, $last: Int, $before: Cursor, $after: Cursor, $fromTime: Date, $toTime: Date, $ignoreEmpty: Boolean, $orderBy: TripOrder, $tripType: TripTypeFilter, $hasNote: Boolean) {vehicle(id: $vehicleId) {id trips(first: $first, last: $last, before: $before, after: $after, fromTime: $fromTime, toTime: $toTime, ignoreEmpty: $ignoreEmpty, orderBy: $orderBy, tripType: $tripType, hasNote: $hasNote) { items { id duration mileage startLatitude startLongitude endLatitude endLongitude time positions { ...VehiclePositionDeepNesting } } pageInfo { hasNextPage hasPreviousPage startCursor endCursor __typename } __typename } __typename } }fragment VehiclePositionDeepNesting on VehiclePosition { latitude longitude }',
      variables: {
        fromTime: lastUpdate,
        first: 100,
        ignoreEmpty: true,
        orderBy: {
          direction: 'DESC',
          field: 'time',
        },
        vehicleId,
      },
    });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  return res.body.data.vehicle.trips.items;
}

async function connect(requestLogin, requestToken, requestWebView, logger) {
  const { username, password } = await requestLogin();

  const token = await loginWithPassword(username, password, logger);
  const deviceToken = await registerDevice(token, logger);
  const userId = await getUserId(token, logger);

  return { deviceToken, userId };
}

async function disconnect() {
  return {};
}

async function collect(state, logger) {
  const { deviceToken, userId, lastUpdate } = state;

  const token = await loginWithDeviceToken(deviceToken, logger);
  const cars = await getCarIds(token, userId, logger);

  let trips = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const vehicleId of cars) {
    // eslint-disable-next-line no-await-in-loop
    trips = trips.concat(await getTrips(token, vehicleId, lastUpdate, logger));
  }

  const activities = trips.map(trip => {
    const datetime = new Date(trip.time);
    return {
      id: `minvolkswagen_${trip.id}`,
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      datetime,
      endDatetime: new Date(datetime.getTime() + 60000 * trip.duration),
      distanceKilometers: trip.mileage,
      transportationMode: TRANSPORTATION_MODE_CAR,
      pathLonLats: trip.positions.map(p => [p.longitude, p.latitude]),
    };
  });

  return { state: { ...state, lastUpdate: new Date().toISOString() }, activities };
}

const config = {
  label: 'MinVolkswagen',
  description: 'collects data from your volkswagen car rides',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  isPrivate: true,
  country: 'DK',
  signupLink: 'https://site.volkswagen.dk/minvolkswagen/',
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
