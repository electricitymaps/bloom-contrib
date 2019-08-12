import { v4 as uuid } from 'uuid';
import request from 'superagent';
import {
  ACTIVITY_TYPE_PURCHASE,
  PURCHASE_CATEGORY_FOOD_SUPERMARKET,
  PURCHASE_CATEGORY_STORE_DEPARTMENT,
  PURCHASE_CATEGORY_TRANSPORTATION_FUEL,
  PURCHASE_CATEGORY_TRANSPORTATION_RAILROAD,
  PURCHASE_CATEGORY_TRANSPORTATION_TAXI,
  PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARKING,
  PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS,
  PURCHASE_CATEGORY_HEALTHCARE_PHARMARCY,
  PURCHASE_CATEGORY_ENTERTAINMENT_AMUSEMENT_PARKS,
  PURCHASE_CATEGORY_STORE_GARDEN,
  PURCHASE_CATEGORY_ENTERTAINMENT_LIQUOR_STORE,
  PURCHASE_CATEGORY_STORE_PET,
  PURCHASE_CATEGORY_ENTERTAINMENT_MOVIE_THEATER,
  PURCHASE_CATEGORY_STORE_BOOKS,
  PURCHASE_CATEGORY_STORE_BARBER_BEAUTY,
  PURCHASE_CATEGORY_STORE_ELECTRONIC,
  PURCHASE_CATEGORY_STORE_HOUSE_FURNISHING,
  PURCHASE_CATEGORY_STORE_CLOTHING,
  PURCHASE_CATEGORY_FOOD_RESTAURANT,
  PURCHASE_CATEGORY_HEALTHCARE_DOCTOR,
} from '../../definitions';
import { HTTPError, AuthenticationError } from '../utils/errors';
import { getActivityTypeForCategory, getTransportationModeForCategory } from '../utils/purchases';

import env from '../loadEnv';
import { convertToEuro } from '../utils/currency/currency';
import { getCallbackUrl } from '../utils/oauth';
/*
Potential improvements:
- only refetch items since last fetch.
- only fetch data from selected accounts
*/

const baseUrl = 'https://api.nordicapigateway.com';
const initializeUrl = `${baseUrl}/v1/authentication/initialize`;
const tokenUrl = `${baseUrl}/v1/authentication/tokens`;
const unattendedUrl = `${baseUrl}/v1/authentication/unattended`;
const accountInfoUrl = `${baseUrl}/v2/accounts`;
const providerInfoUrl = `${baseUrl}/v1/providers/{providerId}`;
const transactionsUrl = `${baseUrl}/v2/accounts/{accountId}/transactions`;
const categoriesUrl = `${baseUrl}/v1/category-sets/DK/categories`;


const agent = request.agent();
agent.set('X-Client-Id', env.NAG_CLIENT_ID).set('X-Client-Secret', env.NAG_CLIENT_SECRET).set('Accept-Language', 'en');

const NAG_CATEGORY = {
  Supermarket: PURCHASE_CATEGORY_FOOD_SUPERMARKET,
  'Remodeling & Repair': PURCHASE_CATEGORY_STORE_DEPARTMENT,
  'Food & Drinks': PURCHASE_CATEGORY_FOOD_RESTAURANT,
  Transfer: null,
  'Shared Expense': null,
  Exclude: null,
  'Pension Payout': null,
  'Unemployment Benefits': null,
  'Student Grant': null,
  'Child Benefits': null,
  'Alimony & Child Support': null,
  'Holiday Pay': null,
  Income: null,
  'Yield & Returns': null,
  'Overpaid Tax': null,
  'Mortgage/Rent': null,
  'Building Insurance': null,
  'Contents Insurance': null,
  Home: null,
  'Home Security': null,
  'Vacation Home Expenses': null,
  'Auto loan etc.': null,
  Fuel: PURCHASE_CATEGORY_TRANSPORTATION_FUEL,
  'Auto Insurance & Assistance': null,
  'Road Tax & Green Tax': null,
  'Public Transport': PURCHASE_CATEGORY_TRANSPORTATION_RAILROAD,
  Taxi: PURCHASE_CATEGORY_TRANSPORTATION_TAXI,
  Parking: PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARKING,
  'Auto & Transport': PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS,
  'Garage & Auto Parts': PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS,
  'Mini-markets & Delicacies': PURCHASE_CATEGORY_FOOD_SUPERMARKET,
  Pharmacy: PURCHASE_CATEGORY_HEALTHCARE_PHARMARCY,
  'Flights & Hotels': null,
  'Car Rental': null,
  'Vacation Home & Camping': PURCHASE_CATEGORY_STORE_DEPARTMENT,
  Household: null,
  'Vacation Activities': PURCHASE_CATEGORY_ENTERTAINMENT_AMUSEMENT_PARKS,
  'Travel Insurance': null,
  'Child Care & Tuition': null,
  'Union & Unemployment Insurance': null,
  'Life & Accident Insurance': null,
  'Pension & Savings': null,
  Salary: null,
  'Public fee': null,
  'Garden & Plants': PURCHASE_CATEGORY_STORE_GARDEN,
  'Advisors & Services': null,
  'Meal Plan': PURCHASE_CATEGORY_FOOD_SUPERMARKET,
  Memberships: null,
  'Housing Benefits': null,
  'Debt & Interest': null,
  Education: null,
  'Tobacco & Alcohol': PURCHASE_CATEGORY_ENTERTAINMENT_LIQUOR_STORE,
  'Other Housing Expenses': null,
  'Online Services & Software': null,
  'Stock Trading': null,
  'Child Savings': null,
  'Pension Savings': null,
  Interest: null,
  'Private Loan (Friends & Family}': null,
  Other: null,
  'Consumer Loan': null,
  'Unpayed Tax': null,
  Fines: null,
  'Late Fees': null,
  'Bank Fees': null,
  'ATM & Checks': null,
  Unknown: null,
  'Other Private Consumption': null,
  Leisure: null,
  'Gifts & Charity': null,
  Pets: PURCHASE_CATEGORY_STORE_PET,
  Baby: PURCHASE_CATEGORY_STORE_DEPARTMENT,
  Betting: null,
  'Cinema, Concerts & Entertainment': PURCHASE_CATEGORY_ENTERTAINMENT_MOVIE_THEATER,
  'Movies, Music & Books': PURCHASE_CATEGORY_STORE_BOOKS,
  'Hairdresser & Personal Care': PURCHASE_CATEGORY_STORE_BARBER_BEAUTY,
  'Hobby & Sports Equipment': PURCHASE_CATEGORY_STORE_DEPARTMENT,
  'Games & Toys': PURCHASE_CATEGORY_STORE_DEPARTMENT,
  'Electronics & Computer': PURCHASE_CATEGORY_STORE_ELECTRONIC,
  'Furniture & Interior': PURCHASE_CATEGORY_STORE_HOUSE_FURNISHING,
  'Clothing & Accessories': PURCHASE_CATEGORY_STORE_CLOTHING,
  'Fast Food & Takeaway': PURCHASE_CATEGORY_FOOD_RESTAURANT,
  'Glasses & Contacts': null,
  'Medical Specialists': PURCHASE_CATEGORY_HEALTHCARE_DOCTOR,
  'Housekeeping & Gardening': PURCHASE_CATEGORY_STORE_GARDEN,
  Travel: null,
  'Phone & Internet': null,
  'TV license & Cable': null,
  'Sports & Leisure': null,
  'Health Insurance': null,
  Utilities: null,
  'Other Savings': null,
};

function parseCategory(category, categoryList) {
  if (category) {
    // Map id to name
    const nagCategory = categoryList.categories.find(cat => cat.category.id === category.id);
    if (!nagCategory) throw new Error(`Couldn't find category matching id '${category.id}'`);
    const nagName = nagCategory.category.name.en;

    const purchaseCategory = NAG_CATEGORY[nagName];
    if (purchaseCategory === undefined) {
      throw new Error(`Unknown nordic-api-gateway category '${nagName}'`);
    }

    return purchaseCategory;
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

async function parseTransactions(transactions, accountDisplayName, bankDisplayName, bankIdentifier) {
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
      res.push({
        id: `nag_${transactions[i].id}`,
        activityType: getActivityTypeForCategory(category),
        datetime: transactions[i].date,
        label: transactions[i].text,
        transportationMode: getTransportationModeForCategory(category),
        accountDisplayName,
        bankDisplayName,
        bankIdentifier,
        purchaseCategory: category,
        costAmount: -transactions[i].amount.value,
        costCurrency: transactions[i].amount.currency,
      });
    }
  }
  return res;
}

async function connect(requestLogin, requestWebView) {
  if (!env.NAG_CLIENT_ID || !env.NAG_CLIENT_SECRET) throw new Error('Environment variables for nordic-api-gateway not set. Please set NAG_CLIENT_ID & NAG_CLIENT_SECRET.');
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

async function collect(state, { logDebug }) {
  await refreshToken(state);

  // Get accounts
  const res = await agent.get(accountInfoUrl);
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  const { accounts } = res.body;

  let activities = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const account of accounts) {
    // Get transactions
    const transactions = await agent.get(transactionsUrl.replace('{accountId}', account.id));

    if (!transactions.ok) {
      const text = await transactions.text();
      throw new HTTPError(text, transactions.status);
    }

    // Get bank info
    const provider = await agent.get(providerInfoUrl.replace('{providerId}', account.providerId));

    if (!provider.ok) {
      const text = await provider.text();
      throw new HTTPError(text, provider.status);
    }

    const a = await parseTransactions(transactions.body.transactions, account.name, provider.body.name, account.providerId);
    activities = a.concat(activities);
  }

  return { activities, state };
}

const config = {
  contributors: ['FelixDQ', 'Kongkille'],
  label: 'Nordic API Gateway',
  country: 'DK',
  type: ACTIVITY_TYPE_PURCHASE,
  isPrivate: true,
  description: 'collects bank statements',
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
