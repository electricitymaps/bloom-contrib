import { v4 as uuid } from 'uuid';
import request from 'superagent';
import {
  ACTIVITY_TYPE_PURCHASE,
  PURCHASE_CATEGORY_FOOD_SUPERMARKET,
  PURCHASE_CATEGORY_STORE_DEPARTMENT,
  PURCHASE_CATEGORY_TRANSPORTATION_FUEL,
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
  PURCHASE_CATEGORY_HEALTHCARE_DOCTOR,
  ACTIVITY_TYPE_MEAL,
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_TRAIN,
  TRANSPORTATION_MODE_CAR,
} from '../../definitions';
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
agent.set('X-Client-Id', env.NAG_CLIENT_ID).set('X-Client-Secret', env.NAG_CLIENT_SECRET).set('Accept-Language', 'en');

const NAG_CATEGORY = {
  Supermarket: { purchaseType: PURCHASE_CATEGORY_FOOD_SUPERMARKET, activityType: ACTIVITY_TYPE_PURCHASE },
  'Remodeling & Repair': { purchaseType: PURCHASE_CATEGORY_STORE_DEPARTMENT, activityType: ACTIVITY_TYPE_PURCHASE },
  'Food & Drinks': { activityType: ACTIVITY_TYPE_MEAL },
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
  'Auto Loan etc.': null,
  Fuel: { purchaseType: PURCHASE_CATEGORY_TRANSPORTATION_FUEL, activityType: ACTIVITY_TYPE_PURCHASE },
  'Auto Insurance & Assistance': null,
  'Road Tax & Green Tax': null,
  'Public Transport': { transportationMode: TRANSPORTATION_MODE_TRAIN, activityType: ACTIVITY_TYPE_TRANSPORTATION },
  Taxi: { transportationMode: TRANSPORTATION_MODE_CAR, activityType: ACTIVITY_TYPE_TRANSPORTATION },
  Parking: { purchaseType: PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARKING, activityType: ACTIVITY_TYPE_PURCHASE },
  'Auto & Transport': { purchaseType: PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS, activityType: ACTIVITY_TYPE_PURCHASE },
  'Garage & Auto Parts': { purchaseType: PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS, activityType: ACTIVITY_TYPE_PURCHASE },
  'Mini-markets & Delicacies': { purchaseType: PURCHASE_CATEGORY_FOOD_SUPERMARKET, activityType: ACTIVITY_TYPE_PURCHASE },
  Pharmacy: { purchaseType: PURCHASE_CATEGORY_HEALTHCARE_PHARMARCY, activityType: ACTIVITY_TYPE_PURCHASE },
  'Flights & Hotels': null,
  'Car Rental': { transportationMode: TRANSPORTATION_MODE_CAR, activityType: ACTIVITY_TYPE_TRANSPORTATION },
  'Vacation Home & Camping': { purchaseType: PURCHASE_CATEGORY_STORE_DEPARTMENT, activityType: ACTIVITY_TYPE_PURCHASE },
  Household: null,
  'Vacation Activities': { purchaseType: PURCHASE_CATEGORY_ENTERTAINMENT_AMUSEMENT_PARKS, activityType: ACTIVITY_TYPE_PURCHASE },
  'Travel Insurance': null,
  'Child Care & Tuition': null,
  'Union & Unemployment Insurance': null,
  'Life & Accident Insurance': null,
  'Pension & Savings': null,
  Salary: null,
  'Public fee': null,
  'Garden & Plants': { purchaseType: PURCHASE_CATEGORY_STORE_GARDEN, activityType: ACTIVITY_TYPE_PURCHASE },
  'Advisors & Services': null,
  'Meal Plan': { purchaseType: PURCHASE_CATEGORY_FOOD_SUPERMARKET, activityType: ACTIVITY_TYPE_PURCHASE },
  Memberships: null,
  'Housing Benefit': null,
  'Debt & Interest': null,
  Education: null,
  'Tobacco & Alcohol': { purchaseType: PURCHASE_CATEGORY_ENTERTAINMENT_LIQUOR_STORE, activityType: ACTIVITY_TYPE_PURCHASE },
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
  Pets: { purchaseType: PURCHASE_CATEGORY_STORE_PET, activityType: ACTIVITY_TYPE_PURCHASE },
  Baby: { purchaseType: PURCHASE_CATEGORY_STORE_DEPARTMENT, activityType: ACTIVITY_TYPE_PURCHASE },
  Betting: null,
  'Cinema, Concerts & Entertainment': { purchaseType: PURCHASE_CATEGORY_ENTERTAINMENT_MOVIE_THEATER, activityType: ACTIVITY_TYPE_PURCHASE },
  'Movies, Music & Books': { purchaseType: PURCHASE_CATEGORY_STORE_BOOKS, activityType: ACTIVITY_TYPE_PURCHASE },
  'Hairdresser & Personal Care': { purchaseType: PURCHASE_CATEGORY_STORE_BARBER_BEAUTY, activityType: ACTIVITY_TYPE_PURCHASE },
  'Hobby & Sports Equipment': { purchaseType: PURCHASE_CATEGORY_STORE_DEPARTMENT, activityType: ACTIVITY_TYPE_PURCHASE },
  'Games & Toys': { purchaseType: PURCHASE_CATEGORY_STORE_DEPARTMENT, activityType: ACTIVITY_TYPE_PURCHASE },
  'Electronics & Computer': { purchaseType: PURCHASE_CATEGORY_STORE_ELECTRONIC, activityType: ACTIVITY_TYPE_PURCHASE },
  'Furniture & Interior': { purchaseType: PURCHASE_CATEGORY_STORE_HOUSE_FURNISHING, activityType: ACTIVITY_TYPE_PURCHASE },
  'Clothing & Accessories': { purchaseType: PURCHASE_CATEGORY_STORE_CLOTHING, activityType: ACTIVITY_TYPE_PURCHASE },
  'Fast Food & Takeaway': { activityType: ACTIVITY_TYPE_MEAL },
  'Glasses & Contacts': null,
  'Medical Specialists': { purchaseType: PURCHASE_CATEGORY_HEALTHCARE_DOCTOR, activityType: ACTIVITY_TYPE_PURCHASE },
  'Housekeeping & Gardening': { purchaseType: PURCHASE_CATEGORY_STORE_GARDEN, activityType: ACTIVITY_TYPE_PURCHASE },
  Travel: null,
  'Phone & Internet': null,
  'TV license & Cable': null,
  'Sports & Leisure': null,
  'Health Insurance': null,
  Utilities: null,
  'Other Savings': null,
  'Other Transport': null,
  'Other Income': null,
  Hide: null,
  'Interest Income': null,
  'Homeowners Association': null,
  'Property Tax': null,
  'Basic Expenses': null,
  'Student Loan': null,
  Tuition: null,
};

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
        activityType: category.activityType,
        datetime: (transactions[i].creationTime || transactions[i].date), // Creation time is not always available. Fallback to booked date
        label: transactions[i].text,
        transportationMode: category.transportationMode, // Only set on transportation purchases
        accountDisplayName,
        bankDisplayName,
        bankIdentifier,
        purchaseType: category.purchaseType,
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

async function fetchTransactions(accountId, fromDate, pagingToken) {
  const res = await agent.get(transactionsUrl.replace('{accountId}', accountId)).query({ fromDate, pagingToken });
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  // If there's more pages of transactions
  if (res.body.pagingToken) {
    return res.body.transactions.concat(await fetchTransactions(accountId, fromDate, res.body.pagingToken));
  }

  return res.body.transactions;
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

    const a = await parseTransactions(transactions, account.name, provider.body.name, account.providerId);
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
