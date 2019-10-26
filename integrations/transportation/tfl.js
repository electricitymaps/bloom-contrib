import moment from 'moment';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PUBLIC_TRANSPORT } from '../../definitions';
import { HTTPError, ValidationError } from '../utils/errors';

const LOGIN_PATH = 'https://account.tfl.gov.uk/api/login';
const BASE_PATH = 'https://mobileapi.tfl.gov.uk'; // For fetching data


async function generateActivities(travelDays) {
  const activities = [];
  travelDays.forEach((day) => {
    day.Journeys.forEach((journey) => {
      console.log(journey);
      activities.push({
        id: '', // a string that uniquely represents this activity
        datetime: journey.StartTime, // a javascript Date object that represents the start of the activity
        durationHours: journey.EndTime && moment(journey.EndTime).diff(moment(journey.StartTime)) / (60 * 60 * 1000), // a floating point that represents the duration of the activity in decimal hours
        distanceKilometers: '', // a floating point that represents the amount of kilometers traveled
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_PUBLIC_TRANSPORT, // a variable (from definitions.js) that represents the transportation mode
        carrier: 'Transport For London', // (optional) a string that represents the transportation company
        departureStation: journey.TransactionType === 'Bus' ? 'Bus' : journey.StartLocation, // (for other travel types) a string that represents the original starting point
        destinationStation: journey.TransactionType === 'Bus' ? 'Bus' : journey.EndLocation, // (for other travel types) a string that represents the final destination
      });
    });
  });
  console.log(activities);
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
    AppId: '9C9C6B6C-A025-493E-8F39-3A6D57C7ACAB', // TODO what do we do with this?
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

  if (!loginResponse.SecurityToken) throw new HTTPError('Login failed');

  console.log(loginResponse);

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

  console.log(apiTokenResponse);

  return {
    securityToken: loginResponse.SecurityToken,
    refreshToken: apiTokenResponse.refresh_token,
    accessToken: apiTokenResponse.access_token,
  };
}

async function collect(state) {
  console.log(state);

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

  console.log(refreshTokenResponse);

  const newState = {
    accessToken: refreshTokenResponse.access_token,
    refreshToken: refreshTokenResponse.refresh_token,
  };

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

  console.log(oysterCardResponse, newState);


  const oysterCards = oysterCardResponse.OysterCards;

  newState.oysterCardNumbers = oysterCards.map(oc => oc.OysterCardNumber);

  if (newState.oysterCardNumbers && newState.oysterCardNumbers.length > 0) {
    // Get data for the first oyster card
    const journeysResponse = await fetch(`${BASE_PATH}/Cards/Oyster/Journeys?startDate=${moment().subtract(10, 'days').format(moment.HTML5_FMT.DATE)}&endDate=${moment().subtract(4, 'days').format(moment.HTML5_FMT.DATE)}`, {
      method: 'get',
      headers: {
        'x-zumo-auth': newState.accessToken,
        oystercardnumber: newState.oysterCardNumbers[0],
      },
    })
      .then(response => response.json())
      .catch((e) => {
        throw new HTTPError(e);
      });
    console.log(journeysResponse);
    const activities = generateActivities(journeysResponse.TravelDays);
    // return { activities, state: newState };
  }
  // return { activities: [], state: newState };
}

async function disconnect() {
  return {};
}

export default {
  connect,
  collect,
  disconnect,
};
