import moment from 'moment';
import flatten from 'lodash/flatten';
import { Client } from '@microsoft/microsoft-graph-client';

import env from '../loadEnv';
import { OAuth2Manager } from '../authentication';
import {
  ACTIVITY_TYPE_DIGITAL,
  DIGITAL_CATEGORY_EMAIL,
  UNIT_ITEM,
} from '../../definitions';

const config = {
  label: 'Outlook',
  description:
    "free personal email service from Microsoft that doesn't scan your email for the purpose of serving you ads",
  type: ACTIVITY_TYPE_DIGITAL,
  isPrivate: true,
  // minRefreshInterval: 60
  version: 1,
};

const manager = new OAuth2Manager({
  baseUrl: 'https://login.microsoftonline.com',
  clientId: env.MSGRAPH_CLIENT_ID,
  clientSecret: env.MSGRAPH_CLIENT_SECRET,
  authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  accessTokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  scope: 'Mail.Read',
});
const odataNextLinkPropertyName = '@odata.nextLink';
const odataDeltaLinkPropertyName = '@odata.deltaLink';
function getActivityFromEmail(message) {
  return {
    id: message.id,
    activityType: ACTIVITY_TYPE_DIGITAL,
    lineItems: [{ identifier: DIGITAL_CATEGORY_EMAIL, unit: UNIT_ITEM, value: 1 }],
    locationLabel: 'Outlook',
    label: 'Email received',
    carrier: 'Microsoft',
    datetime: moment.parseZone(message.lastModifiedDateTime).toDate(),
  };
}
async function fetchRemainingEmailActivities(client, nextLink) {
  const resultActivities = [];
  const messages = await client.api(nextLink).get();
  let resultDeltaLink = messages[odataDeltaLinkPropertyName];
  if (messages[odataNextLinkPropertyName]) {
    const { activities, deltaLink } = await fetchRemainingEmailActivities(
      client,
      messages[odataNextLinkPropertyName]
    );
    resultActivities.push(...activities);
    resultDeltaLink = deltaLink;
  }
  resultActivities.push(...messages.value.map(x => getActivityFromEmail(x)));
  return { activities: resultActivities, deltaLink: resultDeltaLink };
}
function fetchEmail(accessToken, previousDeltaLink) {
  const client = Client.init({
    authProvider: done => {
      done(undefined, accessToken);
    },
  });
  return fetchRemainingEmailActivities(
    client,
    previousDeltaLink !== undefined
      ? previousDeltaLink
      : 'me/mailFolders/inbox/messages/delta?$select=id,lastModifiedDateTime'
  );
}

async function connect(requestLogin, requestWebView) {
  const state = await manager.authorize(requestWebView);
  return state;
}

async function disconnect() {
  return {};
}

async function collect(state = {}, logger) {
  manager.setState(state);

  logger.logDebug(`Initiating collect() with deltaLink=${state.inboxDeltaLink}`);

  const allResults = await Promise.all([fetchEmail(state.accessToken, state.inboxDeltaLink)]);

  return {
    activities: flatten(allResults.map(d => d.activities)).filter(d => d),
    state: {
      ...state,
      inboxDeltaLink: allResults[0].deltaLink,
    },
  };
}

export default {
  connect,
  disconnect,
  collect,
  config,
};
