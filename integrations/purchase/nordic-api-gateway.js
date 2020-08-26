import { v4 as uuid } from 'uuid';
import request from 'superagent';

import { ACTIVITY_TYPE_PURCHASE } from '../../definitions';
import { NAG_CATEGORY } from './nag-categories';
import { HTTPError, AuthenticationError } from '../utils/errors';

import env from '../loadEnv';
import { getCallbackUrl } from '../utils/oauth';

const baseUrl = 'https://api.nordicapigateway.com';
const initializeUrl = `${baseUrl}/v1/authentication/initialize`;
const tokenUrl = `${baseUrl}/v1/authentication/tokens`;
const unattendedUrl = `${baseUrl}/v1/authentication/unattended`;
const accountInfoUrl = `${baseUrl}/v2/accounts`;
const providerInfoUrl = `${baseUrl}/v1/providers/{providerId}`;
const transactionsUrl = `${baseUrl}/v2/accounts/{accountId}/transactions`;
const categoriesUrl = `${baseUrl}/v1/category-sets/DK/categories`;

const agent = request.agent();
agent
  .set('X-Client-Id', env.NAG_CLIENT_ID)
  .set('X-Client-Secret', env.NAG_CLIENT_SECRET)
  .set('Accept-Language', 'en');

function parseCategory(category, categoryList) {
  if (category) {
    // Map id to name
    const nagCategory = categoryList.categories.find(cat => cat.category.id === category.id);
    if (!nagCategory) throw new Error(`Couldn't find category matching id '${category.id}'`);
    const nagName = nagCategory.category.name.en;

    const purchaseType = NAG_CATEGORY[nagName];
    if (purchaseType === undefined) {
      throw new Error(`Unknown nordic-api-gateway category '${nagName}'`);
    }

    return purchaseType;
  }

  return null;
}

async function getCategories() {
  const res = await agent.get(categoriesUrl);
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }
  return res.body;
}

async function parseTransactions(
  transactions,
  accountDisplayName,
  bankDisplayName,
  bankIdentifier
) {
  // { id: '20190608-2600-0',
  //   date: '2019-06-08',
  //   creationTime: null,
  //   text: 'Føtex Storcenter N',
  //   originalText: 'Føtex Storcenter N 45222',
  //   details: null,
  //   category: { id: '132', setId: 'DK' },
  //   amount: { value: -26, currency: 'DKK' },
  //   balance: { value: -8661.76, currency: 'DKK' },
  //   type: 'Card',
  //   state: 'Booked'}

  const categories = await getCategories();

  const res = [];
  for (let i = 0; i < transactions.length; i += 1) {
    const category = parseCategory(transactions[i].category, categories);

    if (category && transactions[i].amount.value < 0) {
      const costAmount = -transactions[i].amount.value;
      const costCurrency = transactions[i].amount.currency;
      const { purchaseType } = category;
      const lineItems = purchaseType
        ? [{ identifier: purchaseType, value: costAmount, unit: costCurrency }]
        : undefined;
      res.push({
        id: `nag_${transactions[i].id}`,
        activityType: category.activityType,
        datetime: transactions[i].creationTime || transactions[i].date, // Creation time is not always available. Fallback to booked date
        label: transactions[i].text,
        transportationMode: category.transportationMode, // Only set on transportation purchases
        accountDisplayName,
        bankDisplayName,
        bankIdentifier,
        lineItems,
        costAmount,
        costCurrency,
      });
    }
  }
  return res;
}

async function connect({ requestWebView }, logger) {
  if (!env.NAG_CLIENT_ID || !env.NAG_CLIENT_SECRET) {
    throw new Error(
      'Environment variables for nordic-api-gateway not set. Please set NAG_CLIENT_ID & NAG_CLIENT_SECRET.'
    );
  }
  const state = {};

  // Unique id for user
  state.userHash = uuid();

  // Get authUrl
  const j = await agent.post(initializeUrl).send({
    userHash: state.userHash,
    redirectUrl: getCallbackUrl(),
    language: 'en',
  });

  // User login
  const code = await requestWebView(j.body.authUrl, getCallbackUrl());

  // Get accessToken from code
  const res = await agent.post(tokenUrl).send(code);

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  state.accessToken = res.body.session.accessToken;
  state.accessExpiresAt = res.body.session.expires;
  state.loginToken = res.body.login.loginToken;
  state.loginExpiresAt = res.body.login.expires;

  return state;
}

async function unattendedLogin(state) {
  const res = await agent.post(unattendedUrl).send({
    userHash: state.userHash,
    loginToken: state.loginToken,
  });

  state.accessToken = res.body.session.accessToken;
  state.accessExpiresAt = res.body.session.expires;
  state.loginToken = res.body.login.loginToken;
  state.loginExpiresAt = res.body.login.expires;

  agent.set('Authorization', `Bearer ${state.accessToken}`);
}

async function refreshToken(state) {
  if (state.accessToken && Date.now() < Date.parse(state.accessExpiresAt)) {
    // Token is still valid
    agent.set('Authorization', `Bearer ${state.accessToken}`);
  } else if (state.loginToken && Date.now() < Date.parse(state.loginExpiresAt)) {
    // Request a new token
    await unattendedLogin(state);
  } else {
    throw new AuthenticationError('loginToken expired.');
  }
}

async function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function fetchTransactions(accountId, fromDate, pagingToken) {
  const res = await agent
    .get(transactionsUrl.replace('{accountId}', accountId))
    .query({ fromDate, pagingToken });
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  // If there's more pages of transactions
  if (res.body.pagingToken) {
    return res.body.transactions.concat(
      await fetchTransactions(accountId, fromDate, res.body.pagingToken)
    );
  }

  return res.body.transactions;
}

async function collect(state, logger) {
  await refreshToken(state);

  // Get accounts
  const res = await agent.get(accountInfoUrl);
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  const { accounts } = res.body;

  let activities = [];

  // Fetch from last update. If not available, then fetch data from the last 90 days.
  let fromDate = state.lastUpdate;

  if (!fromDate) {
    /*
     When saved in the database, the date object gets converted to string.
     We therefore convert it here to make sure that it both when ran directly
     and when the state is loaded from database.
    */
    fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 90);
    fromDate = fromDate.toISOString();
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const account of accounts) {
    // Get transactions
    const transactions = await fetchTransactions(account.id, fromDate);

    // Get bank info
    const provider = await agent.get(providerInfoUrl.replace('{providerId}', account.providerId));

    if (!provider.ok) {
      const text = await provider.text();
      throw new HTTPError(text, provider.status);
    }

    const a = await parseTransactions(
      transactions,
      account.name,
      provider.body.name,
      account.providerId
    );
    activities = a.concat(activities);
  }
  state.lastUpdate = new Date().toISOString();

  return { activities, state };
}

const config = {
  contributors: ['FelixDQ', 'Kongkille'],
  label: 'Nordic API Gateway',
  country: 'DK',
  type: ACTIVITY_TYPE_PURCHASE,
  isPrivate: true,
  isDebugOnly: true,
  description: 'collects bank statements',
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
