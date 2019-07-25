import moment from 'moment';
import request from 'superagent';
import { CookieAccessInfo } from 'cookiejar';

import { ACTIVITY_TYPE_MEAL } from '../../definitions';


/*
Potential improvements:
- only refetch items since last fetch.
*/

// Urls for requests
const LOGIN_URL = 'https://www.nemlig.com/webapi/login/login';
const ORDERS_URL = 'https://www.nemlig.com/webapi/order/GetBasicOrderHistory';
const ORDERS_DETAILS_URL = 'https://www.nemlig.com/webapi/order/GetOrderHistory';


// Create an agent that can hold cookies
const agent = request.agent();

/*
  Remove cookie injected by Imperva Incapsula that contains character '\u0001'
  which causes issues on following requests.
*/
function removeInvalidCookies() {
  /*
      Modifying cookies of a superagent agent is neither documented or supported
      and this should be seen as a 'hack'
  */
  const cookies = agent.jar.getCookies(CookieAccessInfo('nemlig.com', '/'));
  const invalidcookie = cookies.find(cookie => cookie.value.includes('\u0001'));
  if (invalidcookie) invalidcookie.value = '';
}

// Login
async function logIn(username, password, logger) {
  removeInvalidCookies();
  const res = await agent.post(LOGIN_URL).send({
    AppInstalled: false,
    AutoLogin: false,
    CheckForExistingProducts: true,
    DoMerge: true,
    Username: username,
    Password: password,
  }).catch((err) => {
    if (err.response && err.response.body.ErrorMessage) {
      // Most likely wrong username or password
      throw Error(err.response.body.ErrorMessage);
    } else {
      throw err;
    }
  });

  logger.logDebug('Successfully logged in.');
}

async function getOrders(logger) {
  removeInvalidCookies();

  const res = await agent.get(ORDERS_URL).query({ skip: 0, take: 100 });

  const json = JSON.parse(res.text);
  logger.logDebug(`Found ${json.Orders.length} orders`);

  return json.Orders;
}

async function getOrderDetails(ordernumber, logger) {
  removeInvalidCookies();
  const res = await agent.get(ORDERS_DETAILS_URL).query({ orderNumber: ordernumber });

  const json = JSON.parse(res.text);
  logger.logDebug(`Receipt ${ordernumber} has ${json.Lines.length} items`);
  const deliveryDate = moment(json.DeliveryDate, 'DD/MM-YYYY').toDate();

  return json.Lines.map(line => ({
    datetime: deliveryDate,
    activityType: ACTIVITY_TYPE_MEAL,
    product: line.ProductName,
    group: line.GroupName,
    quantity: line.Quantity,
    size: line.Description,
  }));
}



async function connect(requestLogin, requestWebView, logger) {
  // Here we can request credentials etc.

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();

  // Try to login
  // await logIn(username, password, logger);

  // Set state to be persisted
  return {
    username,
    password,
  };
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state, logger) {
  await logIn(state.username, state.password, logger);
  const orders = await getOrders(logger);
  let activities = [];
  for (let i = 0; i < orders.length; i += 1) {
    const batch = await getOrderDetails(orders[i].Id, logger);
    activities = activities.concat(batch);
  }

  return { activities, state };
}

const config = {
  label: 'Nemlig',
  country: 'DK',
  type: ACTIVITY_TYPE_MEAL,
  description: 'Collects receipts from retail account',
  isPrivate: true,
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
