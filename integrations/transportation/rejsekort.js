/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import moment from 'moment';
import request from 'superagent';
import { DOMParser } from 'xmldom';

import {
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
} from '../../definitions';
import { ValidationError } from '../utils/errors';

/*
Potential improvements:
- only refetch items since last fetch.
- handle fetching, parsing DOM and error parsing (looking for "Fejl" once)
- less fragile DOM parsing
- remove accept language headers, as they are not working
*/

// Urls for requests
const LOGIN_URL = 'https://selvbetjening.rejsekort.dk/CWS/Home/UserNameLogin';
const LOGIN_FORM_URL = 'https://selvbetjening.rejsekort.dk/CWS/Home/Index';
const TRAVELS_URL = 'https://selvbetjening.rejsekort.dk/CWS/TransactionServices/TravelCardHistory';
const TRAVELS_FORM_URL =
  'https://selvbetjening.rejsekort.dk/CWS/TransactionServices/TravelCardHistory';
const TRAVEL_FORM_CHANGE_CARD_URL = 'https://selvbetjening.rejsekort.dk/CWS/Home/ChangeCard';

// Create an agent that can hold cookies
const agent = request.agent();

function extractRequestToken(text) {
  const tokenString = text.match(
    /antiForgeryToken = '<input name="__RequestVerificationToken.*/
  )[0];
  const value = tokenString.match(/value=".*"/)[0];
  // Extract
  const token = value.slice(7, value.length - 1);
  return token;
}

function parseHtmlToDocument(html) {
  // Before parsing we have to fix:
  // - missing quotes in class tags (missing for all station names).
  // - use of the deprecated nowrap attribute
  // Otherwise it will cause errors for the DOMParser below.
  const parser = new DOMParser();
  return parser.parseFromString(
    html.replace(/class=>/g, 'class="">').replace(/ nowrap[ ]?/g, ''),
    'text/html'
  );
}

// Get login token
async function getLoginRequestToken(logger) {
  const res = await agent.get(LOGIN_URL).set('Accept-Language', 'en;en-US');
  let token = extractRequestToken(res.text);
  // Sometimes the token has a length > 92 which indicates a problem
  // This never happens in node. It only happens on Android
  if (token.length > 92) {
    logger.logWarning(`Warning: token length of ${token.length} detected.`);
    token = await getLoginRequestToken(logger);
  }
  if (res.text.match(/(is logged in|er logget in)/)) {
    logger.logWarning("We're already logged in..");
  }
  return token;
}

// Login
async function logIn(username, password, logger) {
  const requestToken = await getLoginRequestToken(logger);

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
    const container = document.getElementById('validation-summary-v5-container');
    if (res.text.match(/Error404/)) {
      // Note: this seems to happen when POST request to `LOGIN_FORM_URL` fails
      // which redirects to a page that causes a 404
      // In principle this is fine if we're logged in
    } else if (!container) {
      // Note(olc): This happens every 2nd request on Android if the token length is not 92
      // As a result, we're not logged in.
      throw new Error('Unknown error');
    } else {
      const errors = Array.from(container.getElementsByTagName('li')).map(
        (d) => d.firstChild.textContent
      );
      throw new ValidationError(errors.join(', '));
    }
  } else if (!res.text.match(/(is logged in|er logget in)/)) {
    // Log more info
    logger.logDebug(`Seems like logIn failed. Headers: ${JSON.stringify(res.header)}`);
    throw Error("This doesn't look like the logged-in home page");
  }
  logger.logDebug('Successfully logged in.');
}

const MAX_ITERATIONS = 10;

/**
 * Get all travels for the selected card
 * @param {{logger: Function, token: string}} options
 * @returns Promise<{{allTravelsHTML: string, travelRequestToken: string}> result
 */
async function getAllTravelsForToken({ logger, requestToken }) {
  let travelRequestToken = requestToken;
  let allTravelsHTML = '';

  // Loop over all pages until all travels are included
  for (let i = 0; i < MAX_ITERATIONS; i += 1) {
    // Load next page.
    const res = await agent
      .post(TRAVELS_FORM_URL)
      .type('form')
      .send({
        periodSelected: 'All',
        __RequestVerificationToken: travelRequestToken,
        page: `${i * 5 + 1}`,
      });

    if (!res.text.match(/(is logged in|er logget in)/)) {
      logger.logDebug(`Seems like logIn failed. Headers: ${JSON.stringify(res.header)}`);
      throw Error("We're not logged in.");
    }

    if (!res.text.match(/(Mine rejser|My journeys)/)) {
      throw Error('Response did not contain journeys.');
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

  return { allTravelsHTML, travelRequestToken };
}

async function getTravelFormInformation() {
  const res = await agent.set('Accept-Language', 'en;en-US').get(TRAVELS_URL);

  const document = parseHtmlToDocument(res.text);
  const cardContainer = document.getElementById('cardSelectedId');

  const cards = cardContainer
    ? Array.from(cardContainer.getElementsByTagName('option')).map((element) =>
        element.getAttribute('value')
      )
    : ['unknown-card-id'];

  return {
    requestToken: extractRequestToken(res.text),
    cards,
  };
}

async function getAllTravels(logger) {
  const travelFormInformation = await getTravelFormInformation();
  const { cards } = travelFormInformation;
  let { requestToken } = travelFormInformation;

  let result = '';

  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i];

    if (cards.length > 1) {
      logger.logDebug(`Changing card to ${card}`);

      const res = await agent.post(TRAVEL_FORM_CHANGE_CARD_URL).type('form').send({
        __RequestVerificationToken: requestToken, // FIXME: might be too old now
        cardSelected: card,
        controller: 'TransactionServices',
        action: 'TravelCardHistory',
      });

      if (res.text.match(/(Error|Fejl)/)) {
        throw new Error('Failed changing card');
      }
    }

    const { allTravelsHTML, travelRequestToken } = await getAllTravelsForToken({
      logger,
      requestToken,
    });

    result += allTravelsHTML;
    requestToken = travelRequestToken;
  }

  return result;
}

// Parse travels by looping over all 'tr' elements across tables
// Travels are split in several tables for pagination
function parseTravels(allTravelsHTML, logger) {
  const doc = parseHtmlToDocument(allTravelsHTML);

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
              travelList[travelIndex].number = element.textContent;
            }
          }
        }
        if (!skipRow) {
          if (e === 2) {
            travelList[travelIndex].date = element.textContent;
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
    const splitToken = travelList[a].date.indexOf('-') !== -1 ? '-' : '/';
    const dateSplit = travelList[a].date.split(splitToken);
    const startTime = new Date(
      `20${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}T${travelList[a]['start-time']}`
    );
    const endStr = `20${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}T${travelList[a]['end-time']}`;
    let endTime = new Date(endStr);

    if (Number.isNaN(endTime.getTime())) {
      // Skip that item. It's probably a trip that doesn't have a checkout time
      logger.logWarning(`Skipping item as it has an invalid checkout time "${endStr}".`);
      continue;
    }

    if (endTime < startTime) {
      endTime = moment(endTime).add(1, 'day').toDate();
    }

    activities.push({
      id: `rejsekort${travelList[a].number}`,
      datetime: endTime,
      // this currently only works for travels within the same date
      endDatetime: new Date(endTime.getTime() + (endTime.getTime() - startTime.getTime())),
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      transportationMode: TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
      departureStation: travelList[a]['start-station'].replace('Line : ', ''),
      destinationStation: travelList[a]['end-station'].replace('Line : ', ''),
    });
  }
  return activities;
}

async function connect({ requestLogin }, logger) {
  // Here we can request credentials etc.

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();

  // Try to login
  await logIn(username, password, logger);

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
  const allTravelsHTML = await getAllTravels(logger);
  const activities = parseTravels(allTravelsHTML, logger);

  return { activities, state };
}

const config = {
  id: 'rejsekort',
  label: 'Rejsekort',
  country: 'DK',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  description: 'collects trips from your travel card',
  isPrivate: true,
  signupLink: 'https://selvbetjening.rejsekort.dk/CWS/CustomerRegistration/ValidateNemId',
  contributors: ['tranberg', 'skovhus'],
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
