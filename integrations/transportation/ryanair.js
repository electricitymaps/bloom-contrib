import moment from 'moment';
import request from 'superagent';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PLANE } from '../../definitions';

const agent = request.agent();
const BASE_URL = 'https://api.ryanair.com/userprofile/rest/api/v1/';
const LOGIN_URL = `${BASE_URL}login`;
const PROFILE_URL = `${BASE_URL}secure/users/`;
// user info available at `${PROFILE_URL}${customerId}/profile/full/`

async function logIn(username, password) {
  const res = await agent
    .post(LOGIN_URL)
    .type('application/x-www-form-urlencoded')
    .set('Authorization', 'Basic ')
    .send({
      password,
      username,
    });

  if (!res.ok) {
    console.error('--------RESPONSE---------', res);
    throw Error('Error while logging in.');
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
    throw Error('Password cannot be empty');
  }

  return logIn(username, password);
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function getAllFlights(entries, customerId, token) {
  const allFlights = [];

  await Promise.all(entries.map(async (entry) => {
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
  return allFlights;
}

async function collect(state, logger) {
  const { token, customerId } = state;

  const pastBookings = await agent
    .get(`${PROFILE_URL}${customerId}/bookings/past`)
    .set('Accept', 'application/json')
    .set('X-Auth-Token', token);

  if (!pastBookings.ok) {
    console.error('--------RESPONSE---------', pastBookings);
    throw Error('Error while fetching past bookings.');
  }

  const entries = pastBookings.body.bookings.filter(entry => entry.status === 'Confirmed');

  // WHY: there can be multiple flights in one booking
  const activities = await getAllFlights(entries, customerId, token)
    .then((allFlights) => {
      // WHY: there can be multiple bookings for the same flight (e.g. for different passengers)
      // HOW: filters flights with the same flight number
      const uniqueFlights = Array.from(new Set(allFlights.map(a => a.flightInfo.FlightNumber)))
        .map(mappedFlightNumber => allFlights.find(a => a.flightInfo.FlightNumber === mappedFlightNumber));

      return Object.values(uniqueFlights)
        .map(k => ({
          // TODO: make sure it's always unique
          id: `B${k.bookingId}${k.flightInfo.FlightNumber}PNR${k.pnr}`,
          datetime: k.flightInfo.DepartLocal,
          // TODO: calculate distance between airports using some API
          // distanceKilometers: ,
          durationHours: moment(k.flightInfo.Arrive).diff(moment(k.flightInfo.Depart), 'minutes') / 60,
          activityType: ACTIVITY_TYPE_TRANSPORTATION,
          transportationMode: TRANSPORTATION_MODE_PLANE,
          carrier: 'Ryanair',
          // TODO: "translate" city name abrrievations to full names
          departureStation: k.flightInfo.Origin,
          destinationStation: k.flightInfo.Destination,
        }));
    });

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
