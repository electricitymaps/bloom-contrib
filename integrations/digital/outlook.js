// import moment from 'moment';
import flatten from 'lodash/flatten';
import { Client } from '@microsoft/microsoft-graph-client';

import env from '../loadEnv';
import { OAuth2Manager } from '../authentication';
// import { UNIT_ITEM } from '../../definitions';

import { getActivitiesFromEmail } from './parsers/index';

const config = {
  label: 'Outlook',
  description: 'Detects purchases from your outlook email account from amazon.ca and ikea.ca.',
  isPrivate: true,
  // minRefreshInterval: 60
  version: 1,
  contributors: ['baywet'],
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
// function getActivityFromEmail(message) {
//   return {
//     id: message.id,
//     activityType: ACTIVITY_TYPE_DIGITAL,
//     lineItems: [{ identifier: DIGITAL_CATEGORY_EMAIL, unit: UNIT_ITEM, value: 1 }],
//     locationLabel: 'Outlook',
//     label: 'Email received',
//     carrier: 'Microsoft',
//     datetime: moment.parseZone(message.lastModifiedDateTime).toDate(),
//   };
// }
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
  resultActivities.push(
    ...flatten(
      messages.value.map(x =>
        getActivitiesFromEmail(
          x.subject,
          x.from && x.from.emailAddress && x.from.emailAddress.address,
          x.body && x.body.content,
          new Date(x.lastModifiedDateTime)
        )
      )
    )
  );
  // resultActivities.push(...messages.value.map(x => getActivityFromEmail(x)));
  // TODO: uncomment line above and corresponding function when digital footprint is enabled
  return { activities: resultActivities, deltaLink: resultDeltaLink };
}
async function fetchEmail(client, previousDeltaLink, folderId) {
  return {
    ...(await fetchRemainingEmailActivities(
      client,
      previousDeltaLink === undefined
        ? `me/mailFolders/${folderId}/messages/delta?$select=id,lastModifiedDateTime,body,subject,from`
        : previousDeltaLink
    )),
    folderId,
  };
}

async function fetchEmailFolders(client, nextLink) {
  const result = [];
  const response = await client
    .api(nextLink === undefined ? `me/mailFolders?$select=id` : nextLink)
    .get();
  result.push(...response.value.map(x => x.id));
  if (response[odataNextLinkPropertyName] !== undefined) {
    result.push(...(await fetchEmailFolders(client, response[odataNextLinkPropertyName])));
  }
  return result;
}

async function connect({ requestWebView }, logger) {
  const state = await manager.authorize(requestWebView);
  return state;
}

async function disconnect() {
  return {};
}

async function collect(state = {}, logger) {
  manager.setState(state);

  logger.logDebug(`Initiating collect() for Outlook`);

  const client = Client.init({
    authProvider: done => {
      done(undefined, state.accessToken);
    },
  });

  if (!state.emailFolders) {
    state.emailFolders = (await fetchEmailFolders(client)).map(x => {
      return { folderId: x, deltaLink: undefined };
    });
    logger.logDebug(`Found ${state.emailFolders.length} email folders for Outlook`);
  }

  const allResults = await Promise.all(
    state.emailFolders.map(x => fetchEmail(client, x.deltaLink, x.folderId))
  );
  const activities = flatten(allResults.map(d => d.activities)).filter(d => d);
  logger.logDebug(`Found ${activities.length} activities for Outlook`);
  const emailFolders = allResults.map(d => {
    return { folderId: d.folderId, deltaLink: d.deltaLink };
  });
  return {
    activities,
    state: {
      ...state,
      emailFolders,
    },
  };
}

export default {
  connect,
  disconnect,
  collect,
  config,
};
