import moment from 'moment';
import request from 'superagent';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PLANE } from '../../definitions';
import { HTTPError, AuthenticationError, ValidationError } from '../utils/errors';

const API_VERSION_URL = 'https://wizzair.com/static/metadata.json';
const agent = request.agent();
const HISTORY_API_FETCH_LIMIT = 5;

async function getApiVersionUrl() {
  return fetch(API_VERSION_URL).then(response => response.text());
}

let API_URL;
let BASE_URL;
let LOGIN_URL;
let ITINERARY_URL;
let BOOKINGS_URL;

async function logIn(username, password) {
  // urls have to be assigned here as they're asynchronous and have to be awaited
  await Promise.all(
    (API_URL = await getApiVersionUrl()),
    (BASE_URL = JSON.parse(API_URL.trim()).apiUrl),
    (LOGIN_URL = `${await BASE_URL}/customer/login`),
    (ITINERARY_URL = `${await BASE_URL}/booking/itinerary`),
    (BOOKINGS_URL = `${await BASE_URL}/customer/mybookings`)
  );

  const res = await agent
    .post(LOGIN_URL)
    .type('application/json')
    .set('Accept', '*/*')
    .send({
      username,
      password,
      isAgencyLogin: false,
      captchaResponse: '',
      languageCode: 'en-gb',
    });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }
  return {};
}

async function getPastBookings() {
  const pastBookings = await agent
    .post(BOOKINGS_URL)
    .type('application/json')
    .set('Accept', '*/*')
    .send({
      flightdestination: '',
      flightorigin: '',
      pnr: '',
    });

  if (!pastBookings.ok) {
    const text = await pastBookings.text();
    throw new HTTPError(text, pastBookings.status);
  }

  return {
    pastBookings: pastBookings.body.pastBookings,
  };
}

async function getAllFlights(booking) {
  const allFlights = [];

  await Promise.all(
    booking.map(async singleFlight => {
      await agent
        .post(ITINERARY_URL)
        .type('application/json')
        .set('Accept', '*/*')
        .send({
          keepBooking: false,
          lastName: singleFlight.contactLastName,
          pnr: singleFlight.recordLocator,
        })
        .then(
          res => {
            allFlights.push(
              {
                id: `pnr${res.body.pnr}fn${res.body.outboundFlight.flightNumber}`,
                flight: res.body.outboundFlight || false, // not every booking has both an outbound and a return flight, hence false
                pnr: res.body.pnr,
              },
              {
                id: `pnr${res.body.pnr}fn${res.body.returnFlight.flightNumber}`,
                flight: res.body.returnFlight || false,
                pnr: res.body.pnr,
              }
            );
          },
          async res => {
            if (!res.ok) {
              const text = await res.text();
              throw new HTTPError(text, res.status);
            }
          }
        );
    })
  );

  // WHY: there can be multiple bookings for the same flight (e.g. for different passengers)
  // HOW: filters flights with the same flight number
  const allUniqueFlights = Array.from(
    new Set(allFlights.map(a => a.flight.flightNumber))
  ).map(mappedFlightNumber => allFlights.find(a => a.flight.flightNumber === mappedFlightNumber));
  const noNullFlights = allUniqueFlights.filter(entry => entry.flight !== false);

  return noNullFlights;
}

async function getActivities(allUniqueFlights) {
  const activities = Object.values(allUniqueFlights).map(k => ({
    id: k.id,
    datetime: k.flight.departureDate,
    endDatetime: moment(k.flight.departureDate)
      .add(k.flight.duration)
      .toDate(),
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_PLANE,
    carrier: 'Wizzair',
    departureAirportCode: k.flight.departureStation,
    destinationAirportCode: k.flight.arrivalStation,
  }));
  return activities;
}

async function connect({ requestLogin, logger }) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();

  if (!(password || '').length) {
    throw new ValidationError('Password cannot be empty');
  }

  await logIn(username, password);

  // sets state to be persisted
  return {
    username,
    password,
  };
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state) {
  await logIn(state.username, state.password);
  const { pastBookings } = await getPastBookings();

  let fetchIndex = state.lastTotalCount || 0;
  const slicedResults = pastBookings.slice(fetchIndex, fetchIndex + HISTORY_API_FETCH_LIMIT);

  // WHY: there can be multiple flights in one booking
  const flights = await getAllFlights(slicedResults);
  const activities = await getActivities(flights);
  fetchIndex += HISTORY_API_FETCH_LIMIT;

  return {
    activities,
    state: {
      ...state,
      lastTotalCount: fetchIndex,
    },
  };
}

const config = {
  label: 'WizzAir',
  description: 'collects your Wizz Air plane rides',
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
