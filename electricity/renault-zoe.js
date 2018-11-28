import moment from 'moment';
import request from 'superagent';

import { ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING } from '../../../constants';

const EXPIRED_TOKEN_MESSAGE = 'com.worldline.renault.myzeonline.exception.InvalidAuthenticationException.ExpiredToken';
const BATTERY_SIZE = 22000; // in Wh

/*
  Doc: https://shkspr.mobi/blog/2016/10/reverse-engineering-the-renault-zoe-api/
*/

async function _fetchData(vin, bearerToken, startMonth, endMonth) {
  const url = `https://www.services.renault-ze.com/api/vehicle/${vin}/charge/history`;
  return request
    .get(url)
    .query({
      begin: startMonth,
      end: endMonth,
    })
    .set('Authorization', `Bearer ${bearerToken}`)
    .set('Accept', 'application/json');
}

async function _refreshToken(state) {
  const { token, refreshToken } = state;
  const res = await request
    .post('https://www.services.renault-ze.com/api/user/token/refresh')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({ token, refresh_oken: refreshToken });
  return { token: res.body.token };
}

export async function connect(requestLogin, requestWebView) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();
  const res = await request
    .post('https://www.services.renault-ze.com/api/user/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({ username, password });

  if (res.body.user.associated_vehicles.length > 1) {
    throw Error('More than one VIN number detected.');
  }

  // Set state to be persisted
  return {
    token: res.body.token,
    refreshToken: res.body.refresh_token,
    vin: res.body.user.associated_vehicles[0].VIN,
  };
}

export function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

export async function collect(state) {
  const { vin } = state;
  const startMonth = state.lastFullyCollectedMonth || moment().subtract(2, 'year').format('MMYY');
  const endMonth = moment().format('MMYY');
  // Subtract one month to make sure we always have a full month
  const lastFullyCollectedMonth = moment().subtract(1, 'month').format('MMYY');

  // TODO: Describe conditions under which `connect` should be called upon failure
  const newState = {
    ...state,
    lastFullyCollectedMonth,
  };
  let res;
  try {
    res = await _fetchData(vin, state.token, startMonth, endMonth);
  } catch (e) {
    res = e.response;
    if (res && res.status === 401 && JSON.parse(res.text).message === EXPIRED_TOKEN_MESSAGE) {
      const { token } = await _refreshToken(state);
      newState.token = token;
      res = await _fetchData(vin, token, startMonth, endMonth);
    } else {
      // Throw
      throw new Error(e);
    }
  }

  if (res.status === 204) {
    // No content, `res.body` will be null
    return { activities: [], state: newState };
  }

  /* Look at charge events that are between `type = "START_NOTIFICATION"`
     and `type = "END_NOTIFICATION"`, and interpolate charging power
     using given battery size and measured `charge_level`
  */
  const activities = [];
  res.body.reverse().forEach((d, i) => {
    if (i === 0) { return; }
    const prev = res.body[i - 1];
    if (d.type === 'END_NOTIFICATION' && prev.type === 'START_NOTIFICATION') {
      // Interpolate between start and end
      const start = moment(prev.date);
      const end = moment(d.date);
      const duration = end.valueOf() - start.valueOf();
      const totalPower = (d.charge_level - prev.charge_level) / 100.0 * BATTERY_SIZE;
      if (totalPower <= 0) { return; }
      for (
        let now = moment(start).startOf('hour');
        // now.isSameOrBefore(moment(end).endOf('hour'));
        now.valueOf() <= moment(end).endOf('hour').valueOf();
        now.add(1, 'hour'))
      {
        activities.push({
          activityType: ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
          datetime: now.toDate(),
          durationHours: 1,
          energyWattHours: 1.0 / duration * totalPower * (
            Math.min(end.valueOf(), moment(now).add(1, 'hour').valueOf())
            - Math.max(start.valueOf(), now.valueOf())),
        });
      }
    }
  });

  return { activities, state: newState };
}

export const config = {
  label: 'Renault Zoé',
  description: 'collects car charging times',
  type: ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
  isPrivate: true,
  // minRefreshInterval: 60
};
