import moment from 'moment';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PUBLIC_TRANSPORT } from '../../definitions';
import { HTTPError, ValidationError, AuthenticationError } from '../utils/errors'; // For fetching data
import env from '../loadEnv';

const LOGIN_PATH = 'https://account.tfl.gov.uk/api/login';
const BASE_PATH = 'https://mobileapi.tfl.gov.uk';

async function request(url, opts) {
  try {
    const response = await fetch(url, opts);
    if (!response.ok) {
      // This will be caught by the catch block and recaught
      throw new Error(response.statusText);
    }
    return await response.json();
  } catch (err) {
    // Catch HTTP errors above as well as fetch errors
    throw new HTTPError(err.message);
  }
}

function generateOysterActivities(travelDays) {
  const activities = [];
  travelDays.forEach((day) => {
    day.Journeys.forEach((journey) => {
      if (journey.Charge <= 0) { // ignore topups
        activities.push({
          id: journey.StartTime, // a string that uniquely represents this activity
          datetime: journey.StartTime, // a javascript Date object that represents the start of the activity
          durationHours: journey.EndTime && moment(journey.EndTime).diff(moment(journey.StartTime)) / (60 * 60 * 1000), // a floating point that represents the duration of the activity in decimal hours
          distanceKilometers: null, // a floating point that represents the amount of kilometers traveled (https://www.whatdotheyknow.com/request/bus_passenger_journey_times)
          activityType: ACTIVITY_TYPE_TRANSPORTATION,
          transportationMode: TRANSPORTATION_MODE_PUBLIC_TRANSPORT, // a variable (from definitions.js) that represents the transportation mode
          carrier: 'Transport For London', // (optional) a string that represents the transportation company
          departureStation: journey.TransactionType === 'Bus' ? 'Bus' : journey.StartLocation, // (for other travel types) a string that represents the original starting point
          destinationStation: journey.TransactionType === 'Bus' ? 'Bus' : journey.EndLocation, // (for other travel types) a string that represents the final destination
        });
      }
    });
  });
  return activities;
}

async function fetchOysterCardTravelDays(newState) {
  const { oysterCardNumbers, accessToken } = newState;
  const today = moment().startOf('day');

  const startDate = newState.lastUpdate
    ? moment(newState.lastUpdate).startOf('day')
    : moment().subtract(56, 'days').startOf('day'); // Not sure what max date range is... more than for oyster though

  // Array put the fetch promises into to be resolved later
  const apiPromises = [];

  oysterCardNumbers.forEach((oysterCardNumber) => {
    // First, get most recent data (between startDate and today)
    let fetchStart = startDate;

    while (fetchStart < today) {
      const fetchEnd = moment(fetchStart).add(6, 'days') > today
        ? today
        : moment(fetchStart).add(6, 'days'); // Make sure query is no further than today

      apiPromises.push(
        request(`${BASE_PATH}/Cards/Oyster/Journeys?startDate=${fetchStart.format(moment.HTML5_FMT.DATE)}&endDate=${fetchEnd.format(moment.HTML5_FMT.DATE)}`, {
          method: 'get',
          headers: {
            'x-zumo-auth': accessToken,
            oystercardnumber: oysterCardNumber,
          },
        })
      );
      // Add one day to the end date to get the new start date
      fetchStart = moment(fetchEnd).add(1, 'days');
    }
  });
  const apiResponses = await Promise.all(apiPromises);
  return apiResponses.reduce((accumulator, json) => (json && json.TravelDays.length > 0 ? [...accumulator, ...json.TravelDays] : accumulator), []);
}

function generateContactlessActivities(travelDays) {
  const activities = [];
  travelDays.forEach((day) => {
    day.Journeys.forEach((journey) => {
      activities.push({
        id: journey.StartTime, // a string that uniquely represents this activity
        datetime: journey.StartTime, // a javascript Date object that represents the start of the activity
        durationHours: journey.EndTime && moment(journey.EndTime).diff(moment(journey.StartTime)) / (60 * 60 * 1000), // a floating point that represents the duration of the activity in decimal hours
        distanceKilometers: null, // a floating point that represents the amount of kilometers traveled (https://www.whatdotheyknow.com/request/bus_passenger_journey_times)
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_PUBLIC_TRANSPORT, // a variable (from definitions.js) that represents the transportation mode
        carrier: 'Transport For London', // (optional) a string that represents the transportation company
        departureStation: journey.Destination === null ? 'Bus' : journey.Origin, // (for other travel types) a string that represents the original starting point
        destinationStation: journey.Destination === null ? 'Bus' : journey.Destination, // (for other travel types) a string that represents the final destination
      });
    });
  });
  return activities;
}

async function fetchContactlessCardTravelDays(newState) {
  const { contactlessCardIds, accessToken } = newState;
  const today = moment().startOf('day');

  const startDate = newState.lastUpdate
    ? moment(newState.lastUpdate).startOf('day')
    : moment().subtract(100, 'days').startOf('day'); // Not sure what max date range is... more than for oyster though

  // Array put the fetch promises into to be resolved later
  const apiPromises = [];

  contactlessCardIds.forEach((contactlessCardId) => {
    let fetchStart = startDate;

    while (fetchStart < today) {
      const fetchEnd = moment(fetchStart).add(30, 'days') > today
        ? today
        : moment(fetchStart).add(30, 'days'); // Make sure query is no further than today

      apiPromises.push(
        request(`${BASE_PATH}/contactless/statements/journeys`, {
          method: 'get',
          headers: {
            'x-zumo-auth': accessToken,
            'contactless-card-id': contactlessCardId,
            'from-date': fetchStart.format(moment.HTML5_FMT.DATE),
            'to-date': fetchEnd.format(moment.HTML5_FMT.DATE),
          },
        })
      );
      // Add one day to the end date to get the new fetch start
      fetchStart = moment(fetchEnd).add(1, 'days');
    }
  });
  const apiResponses = await Promise.all(apiPromises);
  return apiResponses.reduce((accumulator, json) => (json && json.Days.length > 0 ? [...accumulator, ...json.Days] : accumulator), []);
}

async function connect(requestLogin) {
  const { username, password } = await requestLogin();
  if (!(password || '').length) {
    throw new ValidationError('Password cannot be empty');
  }

  const postBody = {
    username,
    password,
    AppId: env.TFL_APP_ID,
  };

  const loginResponse = await request(LOGIN_PATH, {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(postBody),
  });

  if (!loginResponse.SecurityToken) throw new AuthenticationError('Login failed');

  const apiTokenResponse = await request(`${BASE_PATH}/APITokens`, {
    method: 'get',
    headers: {
      code: loginResponse.SecurityToken,
      grant_type: 'authorization_code',
    },
  });

  return {
    securityToken: loginResponse.SecurityToken,
    refreshToken: apiTokenResponse.refresh_token,
    accessToken: apiTokenResponse.access_token,
    tokenExpiresAt: apiTokenResponse.expires_in * 1000 + Date.now(),
  };
}

async function collect(state, logger) {
  const newState = {
    ...state,
  };

  if (newState.tokenExpiresAt < Date.now()) {
    // Get access token using the refresh token
    const refreshTokenResponse = await request(`${BASE_PATH}/APITokens/RefreshToken`, {
      method: 'get',
      headers: {
        refresh_token: state.refreshToken,
        access_token: state.accessToken,
      },
    });

    // Update state with new tokens
    newState.accessToken = refreshTokenResponse.access_token;
    newState.refreshToke = refreshTokenResponse.refresh_token;
  }

  // Update oyster cards
  const oysterCardResponse = await request(`${BASE_PATH}/Cards/Oyster`, {
    method: 'get',
    headers: {
      'x-zumo-auth': newState.accessToken,
    },
  });

  // Update contactless cards
  const contactlessCardResponse = await request(`${BASE_PATH}/Contactless/Cards`, {
    method: 'get',
    headers: {
      'x-zumo-auth': newState.accessToken,
    },
  });

  const oysterCards = oysterCardResponse.OysterCards;
  const contactlessCards = contactlessCardResponse;

  newState.oysterCardNumbers = oysterCards && oysterCards.length > 0
    ? oysterCards.map(oc => oc.OysterCardNumber)
    : [];

  newState.contactlessCardIds = contactlessCards && contactlessCards.length > 0
    ? contactlessCards.map(cc => cc.Id)
    : [];

  logger.logDebug(`${newState.oysterCardNumbers.length} oyster cards found`);
  logger.logDebug(`${newState.contactlessCardIds.length} contactless cards found`);

  const oysterCardTravelDays = await fetchOysterCardTravelDays(newState);
  const contactlessCardTravelDays = await fetchContactlessCardTravelDays(newState);

  const activities = [
    ...generateOysterActivities(oysterCardTravelDays),
    ...generateContactlessActivities(contactlessCardTravelDays),
  ];

  newState.lastUpdate = new Date(); // Set the last update so we don't have to fetch all the data on the next collect()
  return { activities, state: newState };
}

async function disconnect() {
  return {};
}

const config = {
  label: 'Transport for London',
  country: 'UK',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  description: 'collects trips from your travel card',
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
