import moment from 'moment';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PUBLIC_TRANSPORT } from '../../definitions';
import { HTTPError, ValidationError, AuthenticationError } from '../utils/errors'; // For fetching data
import env from '../loadEnv';

const LOGIN_PATH = 'https://account.tfl.gov.uk/api/login';
const BASE_PATH = 'https://mobileapi.tfl.gov.uk';

function generateActivities(travelDays) {
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

  const loginResponse = await fetch(LOGIN_PATH, {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(postBody),
  })
    .then(response => response.json())
    .catch((e) => {
      throw new HTTPError(e);
    });

  if (!loginResponse.SecurityToken) throw new AuthenticationError('Login failed');

  const apiTokenResponse = await fetch(`${BASE_PATH}/APITokens`, {
    method: 'get',
    headers: {
      code: loginResponse.SecurityToken,
      grant_type: 'authorization_code',
    },
  })
    .then(response => response.json())
    .catch((e) => {
      throw new HTTPError(e);
    });

  return {
    securityToken: loginResponse.SecurityToken,
    refreshToken: apiTokenResponse.refresh_token,
    accessToken: apiTokenResponse.access_token,
    tokenExpiresAt: apiTokenResponse.expires_in * 1000 + Date.now(),
  };
}

async function getOysterData(accessToken, oysterCardNumber, startMoment, endMoment) {
  // Max 7 days data fetch allowed
  return fetch(`${BASE_PATH}/Cards/Oyster/Journeys?startDate=${startMoment.format(moment.HTML5_FMT.DATE)}&endDate=${endMoment.format(moment.HTML5_FMT.DATE)}`, {
    method: 'get',
    headers: {
      'x-zumo-auth': accessToken,
      oystercardnumber: oysterCardNumber,
    },
  })
    .catch((e) => {
      throw new HTTPError(e);
    });
}

async function collect(state) {
  const newState = {
    ...state,
  };

  if (newState.tokenExpiresAt < Date.now()) {
    // Get access token using the refresh token
    const refreshTokenResponse = await fetch(`${BASE_PATH}/APITokens/RefreshToken`, {
      method: 'get',
      headers: {
        refresh_token: state.refreshToken,
        access_token: state.accessToken,
      },
    })
      .then(response => response.json())
      .catch((e) => {
        throw new HTTPError(e);
      });

    // Update state with new tokens
    newState.accessToken = refreshTokenResponse.access_token;
    newState.refreshToke = refreshTokenResponse.refresh_token;
  }

  // Update oyster cards
  const oysterCardResponse = await fetch(`${BASE_PATH}/Cards/Oyster`, {
    method: 'get',
    headers: {
      'x-zumo-auth': newState.accessToken,
    },
  })
    .then(response => response.json())
    .catch((e) => {
      throw new HTTPError(e);
    });

  // Update contactless cards
  const contactlessCardResponse = await fetch(`${BASE_PATH}/Contactless/Cards`, {
    method: 'get',
    headers: {
      'x-zumo-auth': newState.accessToken,
    },
  })
    .then(response => response.json())
    .catch((e) => {
      throw new HTTPError(e);
    });

  const oysterCards = oysterCardResponse.OysterCards;
  const contactlessCards = contactlessCardResponse;

  newState.oysterCardNumbers = oysterCards && oysterCards.length > 0
    ? oysterCards.map(oc => oc.OysterCardNumber)
    : [];

  newState.contactlessCardIds = contactlessCards && contactlessCards.length > 0
    ? contactlessCards.map(cc => cc.Id)
    : [];

  const today = moment().startOf('day');
  let startDate = state.lastUpdate ? moment(state.lastUpdate).startOf('day') : moment().subtract(56, 'days').startOf('day'); // Max data range is 56 days

  if (newState.oysterCardNumbers && newState.oysterCardNumbers.length > 0) {
    // First, get most recent data (between startDate and today)
    const apiPromises = [];
    while (startDate < today) {
      /* eslint-disable no-await-in-loop */
      // Can only query 7 days at a time on this api:
      const oneWeekEndDate = moment(startDate).add(6, 'days'); // 6 days as it is inclusive
      const adjustedEndDate = oneWeekEndDate > today ? today : oneWeekEndDate; // Make sure query is no further than today
      apiPromises.push(
        getOysterData(
          newState.accessToken,
          newState.oysterCardNumbers[0],
          startDate,
          adjustedEndDate
        )
          .then(response => response.json())
      );
      // Add one day to the end date to get the new start date
      startDate = moment(adjustedEndDate).add(1, 'days');
    }

    let activities = [];
    try {
      const apiResponses = await Promise.all(apiPromises);
      const allTravelDays = apiResponses.reduce((accumulator, json) => (json && json.TravelDays.length > 0 ? [...accumulator, ...json.TravelDays] : accumulator), []);
      activities = generateActivities(allTravelDays);
      newState.lastUpdate = new Date(); // Set the last update so we don't have to fetch all the data on the next collect()
    } catch (e) {
      throw new HTTPError(e);
    }

    return { activities, state: newState };
  }

  return { activities: [], state: newState };
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
