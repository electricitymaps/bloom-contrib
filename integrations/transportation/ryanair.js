import moment from 'moment';
import request from 'superagent';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PLANE } from '../../definitions';
import { HTTPError } from '../utils/errors';

const agent = request.agent();
const BASE_URL = 'https://api.ryanair.com/userprofile/rest/api/v1/';
const LOGIN_URL = `${BASE_URL}login`;
const PROFILE_URL = `${BASE_URL}secure/users/`;
// user info available at `${PROFILE_URL}${customerId}/profile/full/`

async function logIn(username, password) {
  const res = await agent
    .post(LOGIN_URL)
    .type('application/x-www-form-urlencoded')
    .send({
      password,
      username,
    });

  if (!res.ok) {
    throw HTTPError('Error while logging in.');
  }

  return {
    token: res.body.token,
    customerId: res.body.customerId,
  };
}

async function connect(requestLogin, requestWebView) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();

  if (!(password || '').length) {
    throw HTTPError('Password cannot be empty');
  }

  return logIn(username, password);
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function getAllFlights(bookings, customerId, token) {
  const allFlights = [];
  try {
    await Promise.all(bookings.map(async (entry) => {
      await agent
        .put(`${PROFILE_URL}${customerId}/bookings/booking`)
        .set('Accept', 'application/json')
        .set('X-Auth-Token', token)
        .send({
          bookingId: entry.bookingId,
          pnr: entry.pnr,
        })
        .then((res) => {
          if (res.ok) {
            res.body.Flights.forEach((singleFlight) => {
              allFlights.push({
                bookingId: res.body.BookingId,
                flightInfo: singleFlight,
                pnr: res.body.RecordLocator,
              });
            });
          }
        });
    }));
  } catch (error) {
    throw HTTPError(`Error while fetching past flights. ${error}`);
  }

  return allFlights;
}

async function getPastBookings(customerId, token) {
  const pastBookings = await agent
    .get(`${PROFILE_URL}${customerId}/bookings/past`)
    .set('Accept', 'application/json')
    .set('X-Auth-Token', token);

  if (!pastBookings.ok) {
    throw HTTPError(`Error while fetching past bookings. ${pastBookings}`);
  }

  return pastBookings.body.bookings.filter(entry => entry.status === 'Confirmed');
}

async function getActivities(pastBookings, customerId, token) {
  // WHY: there can be multiple flights in one booking
  const allFlights = await getAllFlights(pastBookings, customerId, token);

  // WHY: there can be multiple bookings for the same flight (e.g. for different passengers)
  // HOW: filters flights with the same flight number
  const uniqueFlights = Array.from(new Set(allFlights.map(a => a.flightInfo.FlightNumber)))
    .map(mappedFlightNumber => allFlights.find(a => a.flightInfo.FlightNumber === mappedFlightNumber));

  const activities = Object.values(uniqueFlights)
    .map(k => ({
      // TODO: make sure it's always unique
      id: `B${k.bookingId}${k.flightInfo.FlightNumber}PNR${k.pnr}`,
      datetime: k.flightInfo.DepartLocal,
      durationHours: moment(k.flightInfo.Arrive).diff(moment(k.flightInfo.Depart), 'minutes') / 60,
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      transportationMode: TRANSPORTATION_MODE_PLANE,
      carrier: 'Ryanair',
      departureAirportCode: k.flightInfo.Origin,
      destinationAirportCode: k.flightInfo.Destination,
    }));

  return activities;
}

async function collect(state) {
  const { token, customerId } = state;
  const pastBookings = await getPastBookings(customerId, token);
  const activities = await getActivities(pastBookings, customerId, token);

  return { activities, state };
}

const config = {
  label: 'Ryanair',
  description: 'collects your Ryanair plane rides',
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
