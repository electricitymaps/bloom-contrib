import moment from 'moment';
import request from 'superagent';
import { DOMParser } from 'xmldom';

import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PUBLIC_TRANSPORT } from '../../../constants';

/*
Potential improvements:
- only refetch items since last fetch.
*/

// Urls for requests
const LOGIN_URL = 'https://selvbetjening.rejsekort.dk/CWS/Home/UserNameLogin';
const LOGIN_FORM_URL = 'https://selvbetjening.rejsekort.dk/CWS/Home/Index';
const TRAVELS_URL = 'https://selvbetjening.rejsekort.dk/CWS/TransactionServices/TravelCardHistory';
const TRAVELS_FORM_URL = 'https://selvbetjening.rejsekort.dk/CWS/TransactionServices/TravelCardHistory';

// Create an agent that can hold cookies
const agent = request.agent();

function extractRequestToken(text) {
  const tokenString = text.match(/antiForgeryToken = '<input name="__RequestVerificationToken.*/)[0];
  const value = tokenString.match(/value=".*"/)[0];
  // Extract
  const token = value.slice(7, value.length - 1);
  return token;
}

// Get login token
async function getLoginRequestToken() {
  const res = await agent
    .get(LOGIN_URL)
    .set('Accept-Language', 'en;en-US');
  let token = extractRequestToken(res.text);
  // Sometimes the token has a length > 92 which indicates a problem
  // This never happens in node. It only happens on Android
  if (token.length > 92) {
    token = await getLoginRequestToken();
  }
  return token;
}

// Login
async function logIn(username, password) {
  const requestToken = await getLoginRequestToken();

  const res = await agent
    .post(LOGIN_FORM_URL)
    .type('form')
    // Set everything to English (else it *might* be in Danish). Will be kept in Cookies.
    .set('Accept-Language', 'en;en-US')
    .send({
      Username: username,
      Password: password,
      __RequestVerificationToken: requestToken,
    });

  // Check it was successfull
  if (res.text.match(/(Error|Fejl)/)) {
    // We arrive here if the token is wrong or if the credentials are incorrect
    // Try to parse error
    const parser = new DOMParser();
    const document = parser.parseFromString(res.text, 'text/html');
    const container = document
      .getElementById('validation-summary-v5-container');
    if (!container) {
      // Note(olc): This happens every 2nd request on Android if the token length is not 92
      // As a result, we're not logged in.
      throw Error('Unknown error');
    }
    const errors = Array.from(container.getElementsByTagName('li'))
      .map(d => d.firstChild.textContent);
    throw Error(errors.join(', '));
  }

  if (!res.text.match(/(My Rejsekort|Mit rejsekort)/)) {
    throw Error('This doesn\'t look like the logged-in home page');
  }
}

// Get token for form to get all travels
async function getTravelFormRequestToken() {
  const res = await agent
    .set('Accept-Language', 'en;en-US')
    .get(TRAVELS_URL);
  return extractRequestToken(res.text);
}

// Get all travels
const MAX_ITERATIONS = 10;

async function getAllTravels() {
  let travelRequestToken = await getTravelFormRequestToken();
  let allTravelsHTML = '';

  // Loop over all pages until all travels are included
  for (let i = 0; i < MAX_ITERATIONS; i += 1) {
    // Load next page.
    const res = await agent.post(TRAVELS_FORM_URL).type('form').send({
      periodSelected: 'All',
      __RequestVerificationToken: travelRequestToken,
      page: `${i * 5 + 1}`,
    });

    if (!res.text.match(/(Mine rejser|My journeys)/)) {
      throw Error('Response did not contain journeys. We\'re probably not logged in.');
    }

    // Check if we have exceeded the number of pages
    if (!res.text.match(/(Error|Fejl)/)) {
      allTravelsHTML += res.text;
    } else {
      break;
    }
    if (i === MAX_ITERATIONS) {
      throw Error('Maximum number of iterations have been performed.');
    }

    // Prepare next token
    travelRequestToken = extractRequestToken(res.text);
  }

  return allTravelsHTML;
}

// Parse travels by looping over all 'tr' elements across tables
// Travels are split in several tables for pagination
function parseTravels(allTravelsHTML) {
  // Before parsing we have to fix missing quotes in class tags.
  // Otherwise it will cause errors for the DOMParser below.
  // These quotes are missing for all station names for all travels
  const parser = new DOMParser();
  const doc = parser.parseFromString(allTravelsHTML.replace(/class=>/g, "class=''>"), 'text/html');
  const rows = doc.getElementsByTagName('tr');
  const travelList = [];
  let travelIndex = -1;
  // Lop over all 'tr'
  for (let r = 0; r < rows.length; r += 1) {
    const row = rows[r];
    const elements = row.getElementsByTagName('td');
    const numElements = elements.length;

    // Travel entries have exactly 9 'td' inside the 'tr'.
    // Other entries e.g. refilling money have different numbers
    if (numElements === 9) {
      let skipRow = true;
      // Loop over all 'td' within each 'tr'
      for (let e = 1; e < numElements; e += 1) {
        const element = elements[e];

        // Check existence of travel number
        if (e === 1) {
          if (element.textContent.length > 0) {
            if (!element.textContent.match('/')) {
              skipRow = false;
              travelIndex += 1;
              travelList[travelIndex] = {};
              travelList[travelIndex]['number'] = element.textContent;
            }
          }
        }
        if (!skipRow) {
          if (e === 2) {
            travelList[travelIndex]['date'] = element.textContent;
          }
          if (e === 3) {
            travelList[travelIndex]['start-time'] = element.textContent;
          }
          if (e === 4) {
            travelList[travelIndex]['start-station'] = element.textContent;
          }
          if (e === 5) {
            travelList[travelIndex]['end-time'] = element.textContent;
          }
          if (e === 6) {
            travelList[travelIndex]['end-station'] = element.textContent;
          }
        }
      }
    }
  }

  // Change data format for Greenbit
  const activities = [];
  for (let a = 0; a < travelList.length; a += 1) {
    // Note: this assumes that the date is always formatted using a '/'
    const dateSplit = travelList[a]['date'].split('/');
    const startTime = new Date(`20${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}T${travelList[a]['start-time']}`);
    let endTime = new Date(`20${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}T${travelList[a]['end-time']}`);

    if (Number.isNaN(endTime.getTime())) {
      // Skip that item. It's probably a trip that doesn't have a checkout time
      continue;
    }

    if (endTime < startTime) {
      endTime = moment(endTime).add(1, 'day').toDate();
    }

    activities.push({
      id: `rejsekort${travelList[a]['number']}`,
      datetime: endTime,
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      // this currently only works for travels within the same date
      durationHours: (endTime.getTime() - startTime.getTime()) / 3600000,
      transportationMode: TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
      departureStation: travelList[a]['start-station'].replace('Line : ', ''),
      destinationStation: travelList[a]['end-station'].replace('Line : ', ''),
    });
  }
  return activities;
}

async function connect(requestLogin, requestWebView) {
  // Here we can request credentials etc.

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();

  // Try to login
  await logIn(username, password);

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

async function collect(state) {
  await logIn(state.username, state.password);
  const allTravelsHTML = await getAllTravels();
  const activities = parseTravels(allTravelsHTML);

  // Test activities:
  // activities = [{ id: 'rejsekort10',
  //   datetime: new Date(),
  //   activityType: TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  //   durationHours: 0.23333333333333334,
  //   transportationMode: 'bus' },
  // { id: 'rejsekort9',
  //   datetime: new Date(),
  //   activityType: TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  //   durationHours: 0.18333333333333332,
  //   transportationMode: 'bus' },
  // { id: 'rejsekort8',
  //   datetime: new Date(),
  //   activityType: TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  //   durationHours: 0.5333333333333333,
  //   transportationMode: 'bus' },
  // { id: 'rejsekort7',
  //   datetime: new Date(),
  //   activityType: TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  //   durationHours: 0.5833333333333334,
  //   transportationMode: 'bus' } ]

  return { activities, state };
}

const config = {
  label: 'Rejsekort',
  country: 'DK',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  description: 'collects trips from your travel card',
  isPrivate: true,
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
