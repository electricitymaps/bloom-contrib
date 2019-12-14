import { get } from 'lodash';

import { ACTIVITY_TYPE_TRANSPORTATION } from '../../definitions';
import { HTTPError, ValidationError, AuthenticationError } from '../utils/errors';

const LOGIN_PATH = 'https://www.thetrainline.com/login-service/api/login';
const PAST_BOOKINGS_PATH = 'https://www.thetrainline.com/my-account/api/bookings/past';

function parseCookies(response) {
  const raw = response.headers.raw()['set-cookie'];
  return raw.map((entry) => {
    const parts = entry.split(';');
    const cookiePart = parts[0];
    return cookiePart;
  }).join(';');
}

async function request(url, opts = {}) {
  if (opts.data) {
    opts.body = JSON.stringify(opts.data);
  }
  try {
    const response = await fetch(url, {
      headers: {
        'Content-type': 'application/json',
      },
      ...opts,
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    response.data = await response.json();
    return response;
  } catch (err) {
    throw new HTTPError(err.message);
  }
}

async function connect(requestLogin, requestWebView, logger) {
  const { username, password } = await requestLogin();

  if (!(password || '').length) {
    throw new ValidationError('Password cannot be empty');
  }

  const loginResponse = await request(LOGIN_PATH, {
    method: 'post',
    data: {
      email: username,
      password,
    },
  });

  // Check if authenticated=true on the response body
  if (!loginResponse.data.authenticated) throw new AuthenticationError('Login failed');

  // Save session cookies for use later
  const cookies = parseCookies(loginResponse);

  logger.logDebug('Successfully logged into trainline');

  return {
    username,
    password,
    cookies,
  };
}

async function disconnect() {
  return {};
}

async function collect(state) {
  const pastBookingsRes = await request(PAST_BOOKINGS_PATH, {
    headers: {
      cookie: state.cookies,
    },
  });

  const tripResults = get(pastBookingsRes, 'data.pastBookings.results', []);

  const activities = [];
  tripResults.forEach((trip) => {
    const tripId = trip.booking.id;
    if (get(trip, 'booking.outward')) {
      const outwardDate = get(trip, 'booking.outward.date');
      activities.push({
        id: `${tripId}-${get(trip, 'booking.outward.origin.id')}`, // a string that uniquely represents this activity
        datetime: outwardDate, // a javascript Date object that represents the start of the activity
        durationHours: get(trip, 'booking.outward.duration') / 60, // a floating point that represents the duration of the activity in decimal hours
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: get(trip, 'booking.outward.legs[0].transportMode'), // a variable (from definitions.js) that represents the transportation mode
        departureStation: get(trip, 'booking.outward.origin.name'), // (for other travel types) a string that represents the original starting point
        destinationStation: get(trip, 'booking.outward.destination.name'), // (for other travel types) a string that represents the final destination
      });
    }
    if (get(trip, 'booking.inward')) {
      // sometimes inward journeys are open so don't have a fixed return date. Use the outward date instead
      const inwardDate = get(trip, 'booking.inward.date') || get(trip, 'booking.outward.date');

      // sometimes inward journeys are open so don't have a fixed return date. Use the outward duration instead
      const inwardDuration = (get(trip, 'booking.inward.duration') || get(trip, 'booking.outward.duration')) / 60;

      // sometimes inward journeys are open so don't have a fixed return date. Use the outward transport type instead
      const inwardTransportationMode = get(trip, 'booking.inward.legs[0].transportMode') || get(trip, 'booking.outward.legs[0].transportMode');

      activities.push({
        id: `${tripId}-${get(trip, 'booking.inward.origin.id')}`, // a string that uniquely represents this activity
        datetime: inwardDate, // a javascript Date object that represents the start of the activity
        durationHours: inwardDuration, // a floating point that represents the duration of the activity in decimal hours
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: inwardTransportationMode, // a variable (from definitions.js) that represents the transportation mode
        departureStation: get(trip, 'booking.inward.origin.name'), // (for other travel types) a string that represents the original starting point
        destinationStation: get(trip, 'booking.inward.destination.name'), // (for other travel types) a string that represents the final destination
      });
    }
  });
  return {
    activities,
    newState: state,
  };
}

const config = {
  label: 'Trainline',
  country: 'UK',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  description: 'collects trips from your train and bus journeys',
  isPrivate: true,
  signupLink: null,
  contributors: ['liamgarrison'],
  // minRefreshInterval: 60
};

export default {
  connect,
  collect,
  disconnect,
  config,
};
