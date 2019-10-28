import moment from 'moment';
import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PUBLIC_TRANSPORT } from '../../definitions';
import { HTTPError, ValidationError } from '../utils/errors'; // For fetching data
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

  if (!loginResponse.SecurityToken) throw new HTTPError('Login failed');

  // console.log(loginResponse);

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

  // console.log(apiTokenResponse);

  return {
    securityToken: loginResponse.SecurityToken,
    refreshToken: apiTokenResponse.refresh_token,
    accessToken: apiTokenResponse.access_token,
  };
}

async function getOneWeeksOysterData(accessToken, oysterCardNumber, startMoment, endMoment) {
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

  // Always update state with new tokens
  const newState = {
    accessToken: refreshTokenResponse.access_token,
    refreshToken: refreshTokenResponse.refresh_token,
  };

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

  const oysterCards = oysterCardResponse.OysterCards;

  newState.oysterCardNumbers = oysterCards.map(oc => oc.OysterCardNumber);

  const today = moment().startOf('day');

  let startDate = moment().subtract(56, 'days').startOf('day'); // Max data range is 56 days

  if (newState.oysterCardNumbers && newState.oysterCardNumbers.length > 0) {
    const travelDays = []; // Array of objects for each day travelled, with journeys inside them
    // First, get most recent data (between startDate and today)
    while (startDate < today) {
      /* eslint-disable no-await-in-loop */
      // Can only query 7 days at a time on this api:
      const oneWeekEndDate = moment(startDate).add(6, 'days'); // 6 days as it is inclusive
      const adjustedEndDate = oneWeekEndDate > today ? today : oneWeekEndDate; // Make sure query is no further than today
      const apiResponse = await getOneWeeksOysterData(
        newState.accessToken,
        newState.oysterCardNumbers[0],
        startDate,
        adjustedEndDate
      );
      // Add one day to the end date to get the new start date
      startDate = moment(adjustedEndDate).add(1, 'days');
      if (apiResponse.ok) {
        const json = await apiResponse.json();
        Array.prototype.push.apply(travelDays, json.TravelDays);
      }
    }

    const activities = generateActivities(travelDays);

    newState.lastDataFetch = new Date();

    return { activities, state: newState };
  }

  return { activities: [], state: newState };
}

async function disconnect() {
  return {};
}

export default {
  connect,
  collect,
  disconnect,
};
