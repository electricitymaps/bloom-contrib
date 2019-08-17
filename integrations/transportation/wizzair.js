import moment from 'moment';
import request from 'superagent';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PLANE } from '../../definitions';
import { HTTPError, AuthenticationError } from '../utils/errors';

const API_VERSION_URL = 'https://wizzair.com/static/metadata.json';
const agent = request.agent();

// async function getApiVersionUrl() {
//   // try {
//   console.log('res');
//   const res = await agent
//     .get(API_VERSION_URL)
//     .set('Accept', 'application/json')
//     .set('Content-Type', 'application/json')
//     .catch(res => console.error(res));
    
//   console.log(res.rawResponse, 'STATUS', res.status);
  
//   // } catch (e) {
//   //   console.error('error', e);
//   // }
// }

const BASE_URL = 'https://be.wizzair.com/9.15.0/Api/';
const LOGIN_URL = `${BASE_URL}customer/login`;
const ITINERARY_URL = `${BASE_URL}booking/itinerary`;
const HISTORY_API_FETCH_LIMIT = 5;

async function logIn(username, password) {
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
    throw new AuthenticationError(`Error while logging in. ${res.body}`);
  }
  return {};
}

async function getPastBookings() {
  const pastBookings = await agent
    .post(`${BASE_URL}customer/mybookings`)
    .type('application/json')
    .set('Accept', '*/*')
    .send({
      flightdestination: '',
      flightorigin: '',
      pnr: '',
    })
    .then(
      null,
      (res) => {
        throw new HTTPError(`Error while fetching last bookings. ${res.body}`);
      }
    );

  return { 
    pastBookings: pastBookings.body.pastBookings, 
    // totalCount: pastBookings.body.length,
  };
}

async function getAllFlights(booking) {
  const allFlights = [];

  await Promise.all(booking.map(async (singleFlight) => {
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
        (res) => {
          
          allFlights.push({
            id: `pnr${res.body.pnr}fn${res.body.outboundFlight.flightNumber}`,
            flight: res.body.outboundFlight || false, // not every booking has both an outbound and a return flight, hence false
            pnr: res.body.pnr,
          }, {
            id: `pnr${res.body.pnr}fn${res.body.returnFlight.flightNumber}`,
            flight: res.body.returnFlight || false,
            pnr: res.body.pnr,
          });
        }, ((res) => {
          throw new HTTPError(`Error while fetching flights. ${res.body}`);
        })
      );
  }));

  // WHY: there can be multiple bookings for the same flight (e.g. for different passengers)
  // HOW: filters flights with the same flight number
  const allUniqueFlights = Array.from(new Set(allFlights.map(a => a.flight.flightNumber)))
    .map(mappedFlightNumber => allFlights.find(a => a.flight.flightNumber === mappedFlightNumber));
  const noNullFlights = allUniqueFlights.filter(entry => entry.flight !== false);

  return noNullFlights;
}

async function getActivities(allUniqueFlights) {
  const activities = Object.values(allUniqueFlights)
    .map(k => ({
      id: k.id,
      datetime: k.flight.departureDate,
      durationHours: moment.duration(k.flight.duration).asHours(),
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      transportationMode: TRANSPORTATION_MODE_PLANE,
      carrier: 'Wizzair',
      departureAirportCode: k.flight.departureStation,
      destinationAirportCode: k.flight.arrivalStation,
    }));
  return activities;
}

async function connect(requestLogin, requestWebView, logger) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();

  if (!(password || '').length) {
    throw new HTTPError('Password cannot be empty');
  }

  return logIn(username, password);
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state) {
  // TODO: automatically get the url of the latest API
  // await getApiVersionUrl();
  const {
    pastBookings,
    // totalCount,
  } = await getPastBookings();

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
