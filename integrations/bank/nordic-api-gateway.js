import request from 'superagent';
import { ACTIVITY_TYPE_BANK } from '../../definitions';
import isReactNative from '../utils/isReactNative';
import generateGUID from '../utils/generateGUID';

import env from '../loadEnv';

/*
Potential improvements:
- only refetch items since last fetch.
- only fetch data from selected accounts
*/

const categoriesMap = require('./nordic-api-gateway/categories_map.json');
const categoriesTranslation = require('./nordic-api-gateway/categories_translation.json');

const callbackUrl = isReactNative
  ? 'com.tmrow.greenbit://oauth_callback'
  : 'http://localhost:3000/oauth_callback';

const baseUrl = 'https://api.nordicapigateway.com';
const initializeUrl = `${baseUrl}/v1/authentication/initialize`;
const tokenUrl = `${baseUrl}/v1/authentication/tokens`;
const unattendedUrl = `${baseUrl}/v1/authentication/unattended`;
const accountInfoUrl = `${baseUrl}/v2/accounts`;
const transactionsUrl = `${baseUrl}/v2/accounts/{accountId}/transactions`;

const agent = request.agent();
agent.set('X-Client-Id', env.NAG_CLIENT_ID).set('X-Client-Secret', env.NAG_CLIENT_SECRET);

function parseCategory(category) {
  if (category) {
    // Map id to name
    const mapped = categoriesMap.categories.find(cat => cat.category.id === category.id);
    const mappedName = mapped.category.name.en;

    // Translate name to name recognized by åland
    const translated = categoriesTranslation.find(m => m.APIcat === mappedName);
    const translatedName = translated.AlandCat;

    return translatedName;
  }

  return null;
}

function parseTransactions(transactions, accountName) {
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

  return transactions.map(t => ({
    id: `nag_${t.id}`,
    accountName,
    activityType: ACTIVITY_TYPE_BANK,
    datetime: t.date,
    text: t.text,
    category: parseCategory(t.category),
    amount: t.amount,
  }));
}

async function connect(requestLogin, requestWebView) {
  const state = {};

  // Unique id for user
  state.userHash = generateGUID();

  // Get authUrl
  const j = await agent.post(initializeUrl).send({
    userHash: state.userHash,
    redirectUrl: callbackUrl,
    language: 'en',
  });

  // User login
  const code = await requestWebView(j.body.authUrl, callbackUrl);

  // Get accessToken from code
  const res = await agent.post(tokenUrl).send(code);

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
    throw Error('loginToken expired.');
  }
}

async function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state, { logDebug }) {
  await refreshToken(state);

  // Get accounts
  const res = await agent.get(accountInfoUrl);
  const accounts = res.body.accounts;

  let activities = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const account of accounts) {
    logDebug(account.id);
    const tr = await agent.get(transactionsUrl.replace('{accountId}', account.id));
    const a = parseTransactions(tr.body.transactions, account.name);
    activities = a.concat(activities);
  }

  return { activities, state };
}

const config = {
  contributors: ['FelixDQ', 'Kongkille'],
  label: 'Nordic API Gateway',
  type: ACTIVITY_TYPE_BANK,
  isPrivate: true,
  description: 'collects bank statements',
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
