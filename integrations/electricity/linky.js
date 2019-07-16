import moment from 'moment';
import linky from '@bokub/linky';
import groupBy from 'lodash/groupBy';
import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';

async function connect(requestLogin) {
  const { username, password } = await requestLogin();
  if (!username || !password) {
    throw new Error('e-mail and password are mandatory');
  }
  await linky.login(username, password); // Will throw an error if something is wrong
  return { username, password };
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state) {
  const start = state.lastFullyCollectedDay
    ? moment(state.lastFullyCollectedDay).add(1, 'd')
    : moment().subtract(30, 'd');

  const session = await linky.login(state.username, state.password);
  const response = await session.getHourlyData({
    start: start.format('DD/MM/YYYY'),
    end: moment().format('DD/MM/YYYY'),
  });

  const activities = Object.entries(groupBy(response, e => e.date.substr(0, 10)))
    .map(([k, values]) => {
      const hourlyValues = values
        .map((e, i) => (i % 2 === 1 ? Math.round(1000 * (e.value + values[i - 1].value)) : 0))
        .filter((e, i) => i % 2 === 1); // 30 min steps -> 1 hour steps
      return {
        id: `linky-${k}`,
        datetime: moment(k).toDate(),
        activityType: ACTIVITY_TYPE_ELECTRICITY,
        energyWattHours: hourlyValues.reduce((a, b) => a + b, 0),
        durationHours: hourlyValues.length,
        hourlyEnergyWattHours: hourlyValues,
      };
    });

  const lastFullyCollectedDay = activities
    .reduce((a, b) => (b.energyWattHours ? b.id.substr(6) : a), null);

  return { activities, state: { ...state, lastFullyCollectedDay } };
}

const config = {
  label: 'Linky',
  contributors: ['bokub'],
  country: 'FR',
  description: 'collects electricity data from your smart meter',
  type: ACTIVITY_TYPE_ELECTRICITY,
  isPrivate: true,
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
