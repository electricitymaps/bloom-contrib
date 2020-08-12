import moment from 'moment';
import { GraphQLClient } from 'graphql-request';
import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { OAuth2Manager } from '../authentication';
import env from '../loadEnv';

const manager = new OAuth2Manager({
  accessTokenUrl: 'https://thewall.tibber.com/connect/token',
  authorizeUrl: 'https://thewall.tibber.com/connect/authorize',
  baseUrl: 'https://thewall.tibber.com',
  clientId: env.TIBBER_CLIENT_ID,
  clientSecret: env.TIBBER_CLIENT_SECRET,
  scope: 'scope=tibber_graph',
});

async function connect(requestLogin, requestWebView) {
  return manager.authorize(requestWebView);
}

async function disconnect() {
  await manager.deauthorize();
  return {};
}

const homesQuery = (nofDays) => /* GraphQL */ `
    {
      viewer { 
        homes {
          consumption(resolution: DAILY, last: ${nofDays}) {
            nodes {
              to
              consumption
            }
          }
          address {
            latitude
            longitude
          }
        } 
      }
    }
  `;

async function fetchActivities(state, startDate) {
  const nofDays = moment(startDate)
    .diff(moment(), 'days');
  const { homes } = (await state.gqlClient.request(homesQuery(nofDays))).viewer;
  const nodes = homes.flatMap(h => h.consumption.nodes);
  const { latitude, longitude } = homes[0].address;

  const lastFullyCollectedDay = moment.max(nodes.map(n => moment(n.to)));

  const activities = nodes.map(n => {
    return {
      id: `tibber${moment(n.to)
        .toDate()
        .toISOString()}`,
      datetime: moment(n.to)
        .toDate(),
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: n.consumption,
      durationHours: 24,
      locationLon: longitude,
      locationLat: latitude,
    };
  });

  return {
    activities,
    state: {
      ...state,
      lastCollect: lastFullyCollectedDay.toDate()
        .toISOString(),
    },
  };
}

async function collect(state) {
  manager.setState(state);

  const startDate = state.lastFullyCollectedDay || moment()
    .subtract(3, 'month')
    .format('DD/MM/YYYY');

  if (!state.gqlClient) {
    const endpoint = 'https://api.tibber.com/v1-beta/gql';
    state.gqlClient = new GraphQLClient(
      endpoint, {
        headers: {
          Authorization: `Bearer ${state.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return fetchActivities(state, startDate);
}

const config = {
  description: 'collects electricity data from your smart meter',
  label: 'Tibber',
  country: 'NO',
  isPrivate: true,
  type: ACTIVITY_TYPE_ELECTRICITY,
  signupLink: 'https://tibber.com/no?modal=download',
  contributors: ['torbjornvatn'],
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
