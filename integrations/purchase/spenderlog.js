import moment from 'moment';
import request from 'superagent';
import {
  ACTIVITY_TYPE_PURCHASE,
  PURCHASE_CATEGORY_FOOD_SUPERMARKET,
} from '../../definitions';
import { HTTPError, AuthenticationError } from '../utils/errors';

import env from '../loadEnv';

const BASE_URL = 'https://gw.data4insight.com';
const TOKEN_URL = `${BASE_URL}/auth/get_token`;
const LOGIN_URL = `${BASE_URL}/auth/login_spenderlog_user`;
const ACTIVITIES_URL = `${BASE_URL}/data/co2`;
const CATEGORIES_URL = `${BASE_URL}/data/categories`;
const DATE_FORMAT = 'YYYY-MM-DD';

// get initial request token for api access
async function getRequestToken() {
  const res = await request
    .post(TOKEN_URL)
    .send({
      api_key: env.SPENDERLOG_API_KEY,
      secret: env.SPENDERLOG_API_SECRET,
    });
  if (!res.ok) {
    throw new HTTPError(res.text, res.status);
  }

  return res.body.access_token;
}

// login and get an access_token in return for future calls
async function login(username, password) {
  if (!(password || '').length) {
    throw Error('Password cannot be empty');
  }

  // Get a request_token from the API that allows us to make the later calls
  const requestToken = await getRequestToken();

  const res = await request
    .post(LOGIN_URL)
    .send({ username, password })
    .set('Authorization', `Bearer ${requestToken}`);
  if (!res.ok) {
    throw new AuthenticationError(res.text, res.status);
  }

  return res.body.access_token;
}

async function connect(requestLogin) {
  if (!env.SPENDERLOG_API_KEY || !env.SPENDERLOG_API_SECRET) {
    throw new Error(
      'Environment variables for spenderlog not set. Please set SPENDERLOG_API_KEY & SPENDERLOG_API_SECRET.'
    );
  }
  const { username, password } = await requestLogin();
  return {
    username,
    password,
  };
}

async function fetchActivities(startDate, endDate, accessToken) {
  const res = await request
    .post(ACTIVITIES_URL)
    .send({ from_date: startDate, to_date: endDate })
    .set('Authorization', `Bearer ${accessToken}`);
  if (!res.ok) {
    throw new HTTPError(res.text, res.status);
  }
  return res.body.result;
}

async function parseActivities(rawActivities) {
  // TODO: Handle this parsing - how do we do it, when the co2 calculations are already done?
  // TODO: Handle categories - get an API endpoint from Spenderlog if possible

  const activities = Object.values(rawActivities).map(a => ({
    // TODO: We don't get an identifier from the API - should we generate a UUID here instead?
    id: `spenderlog_${a.date + a.category_id + a.value}`,
    activityType: ACTIVITY_TYPE_PURCHASE,
    datetime: moment(a.date).toDate(),
    label: '',
    transportationMode: null,
    accountDisplayName: null,
    bankDisplayName: null,
    bankIdentifier: null,
    purchaseType: PURCHASE_CATEGORY_FOOD_SUPERMARKET,
    costAmount: a.value,
    costCurrency: 'kg',
  }));

  return activities;
}

async function getActivities(startDate, endDate, token) {
  const rawActivities = await fetchActivities(startDate, endDate, token);
  const activities = await parseActivities(rawActivities);

  // Find the most recent date in the activities
  const endMoment = moment.max(rawActivities.map(r => moment(r.date)));

  return { activities, endMoment };
}

async function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state, logger) {
  if (!state.username || !state.password) {
    return { activities: [], state };
  }

  // TODO: Create better auth handling over time to minimise amount of calls to the API
  const accessToken = await login(
    state.username,
    state.password,
  );
  const startDate = state.lastFullyCollectedDay
    || moment()
      .subtract(1, 'month')
      .format(DATE_FORMAT);
  const endDate = moment().format(DATE_FORMAT);
  const { activities, endMoment } = await getActivities(
    startDate,
    endDate,
    accessToken
  );

  // Subtract one day to make sure we always have a full day
  const lastFullyCollectedDay = endMoment
    .subtract(1, 'day')
    .format(DATE_FORMAT);

  return { activities, state: { ...state, lastFullyCollectedDay } };
}

const config = {
  contributors: ['madsnedergaard'],
  label: 'Spenderlog',
  country: 'DK',
  type: ACTIVITY_TYPE_PURCHASE,
  isPrivate: true,
  isDebugOnly: true,
  description: 'collects receipts from shopping',
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
