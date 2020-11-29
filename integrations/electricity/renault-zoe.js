import moment from 'moment';
import request from 'superagent';

import { ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING } from '../../definitions';
import { HTTPError } from '../utils/errors';

const VERSION = 2;

const EXPIRED_TOKEN_MESSAGE =
  'com.worldline.renault.myzeonline.exception.InvalidAuthenticationException.ExpiredToken';
const BATTERY_SIZE = 22000; // in Wh

/*
  Doc: https://shkspr.mobi/blog/2016/10/reverse-engineering-the-renault-zoe-api/
*/

// https://gist.github.com/sindresorhus/1341699
// eslint-disable-next-line
const COUNTRY_CODE_TO_LATLON = {
  ad: [42.5, 1.5],
  ae: [24.0, 54.0],
  af: [33.0, 65.0],
  ag: [17.05, -61.8],
  ai: [18.25, -63.1667],
  al: [41.0, 20.0],
  am: [40.0, 45.0],
  an: [12.25, -68.75],
  ao: [-12.5, 18.5],
  ap: [35.0, 105.0],
  aq: [-90.0, 0.0],
  ar: [-34.0, -64.0],
  as: [-14.3333, -170.0],
  at: [47.3333, 13.3333],
  au: [-27.0, 133.0],
  aw: [12.5, -69.9667],
  az: [40.5, 47.5],
  ba: [44.0, 18.0],
  bb: [13.1667, -59.5333],
  bd: [24.0, 90.0],
  be: [50.8333, 4.0],
  bf: [13.0, -2.0],
  bg: [43.0, 25.0],
  bh: [26.0, 50.55],
  bi: [-3.5, 30.0],
  bj: [9.5, 2.25],
  bm: [32.3333, -64.75],
  bn: [4.5, 114.6667],
  bo: [-17.0, -65.0],
  br: [-10.0, -55.0],
  bs: [24.25, -76.0],
  bt: [27.5, 90.5],
  bv: [-54.4333, 3.4],
  bw: [-22.0, 24.0],
  by: [53.0, 28.0],
  bz: [17.25, -88.75],
  ca: [60.0, -95.0],
  cc: [-12.5, 96.8333],
  cd: [0.0, 25.0],
  cf: [7.0, 21.0],
  cg: [-1.0, 15.0],
  ch: [47.0, 8.0],
  ci: [8.0, -5.0],
  ck: [-21.2333, -159.7667],
  cl: [-30.0, -71.0],
  cm: [6.0, 12.0],
  cn: [35.0, 105.0],
  co: [4.0, -72.0],
  cr: [10.0, -84.0],
  cu: [21.5, -80.0],
  cv: [16.0, -24.0],
  cx: [-10.5, 105.6667],
  cy: [35.0, 33.0],
  cz: [49.75, 15.5],
  de: [51.0, 9.0],
  dj: [11.5, 43.0],
  dk: [56.0, 10.0],
  dm: [15.4167, -61.3333],
  do: [19.0, -70.6667],
  dz: [28.0, 3.0],
  ec: [-2.0, -77.5],
  ee: [59.0, 26.0],
  eg: [27.0, 30.0],
  eh: [24.5, -13.0],
  er: [15.0, 39.0],
  es: [40.0, -4.0],
  et: [8.0, 38.0],
  eu: [47.0, 8.0],
  fi: [64.0, 26.0],
  fj: [-18.0, 175.0],
  fk: [-51.75, -59.0],
  fm: [6.9167, 158.25],
  fo: [62.0, -7.0],
  fr: [46.0, 2.0],
  ga: [-1.0, 11.75],
  gb: [54.0, -2.0],
  gd: [12.1167, -61.6667],
  ge: [42.0, 43.5],
  gf: [4.0, -53.0],
  gh: [8.0, -2.0],
  gi: [36.1833, -5.3667],
  gl: [72.0, -40.0],
  gm: [13.4667, -16.5667],
  gn: [11.0, -10.0],
  gp: [16.25, -61.5833],
  gq: [2.0, 10.0],
  gr: [39.0, 22.0],
  gs: [-54.5, -37.0],
  gt: [15.5, -90.25],
  gu: [13.4667, 144.7833],
  gw: [12.0, -15.0],
  gy: [5.0, -59.0],
  hk: [22.25, 114.1667],
  hm: [-53.1, 72.5167],
  hn: [15.0, -86.5],
  hr: [45.1667, 15.5],
  ht: [19.0, -72.4167],
  hu: [47.0, 20.0],
  id: [-5.0, 120.0],
  ie: [53.0, -8.0],
  il: [31.5, 34.75],
  in: [20.0, 77.0],
  io: [-6.0, 71.5],
  iq: [33.0, 44.0],
  ir: [32.0, 53.0],
  is: [65.0, -18.0],
  it: [42.8333, 12.8333],
  jm: [18.25, -77.5],
  jo: [31.0, 36.0],
  jp: [36.0, 138.0],
  ke: [1.0, 38.0],
  kg: [41.0, 75.0],
  kh: [13.0, 105.0],
  ki: [1.4167, 173.0],
  km: [-12.1667, 44.25],
  kn: [17.3333, -62.75],
  kp: [40.0, 127.0],
  kr: [37.0, 127.5],
  kw: [29.3375, 47.6581],
  ky: [19.5, -80.5],
  kz: [48.0, 68.0],
  la: [18.0, 105.0],
  lb: [33.8333, 35.8333],
  lc: [13.8833, -61.1333],
  li: [47.1667, 9.5333],
  lk: [7.0, 81.0],
  lr: [6.5, -9.5],
  ls: [-29.5, 28.5],
  lt: [56.0, 24.0],
  lu: [49.75, 6.1667],
  lv: [57.0, 25.0],
  ly: [25.0, 17.0],
  ma: [32.0, -5.0],
  mc: [43.7333, 7.4],
  md: [47.0, 29.0],
  me: [42.0, 19.0],
  mg: [-20.0, 47.0],
  mh: [9.0, 168.0],
  mk: [41.8333, 22.0],
  ml: [17.0, -4.0],
  mm: [22.0, 98.0],
  mn: [46.0, 105.0],
  mo: [22.1667, 113.55],
  mp: [15.2, 145.75],
  mq: [14.6667, -61.0],
  mr: [20.0, -12.0],
  ms: [16.75, -62.2],
  mt: [35.8333, 14.5833],
  mu: [-20.2833, 57.55],
  mv: [3.25, 73.0],
  mw: [-13.5, 34.0],
  mx: [23.0, -102.0],
  my: [2.5, 112.5],
  mz: [-18.25, 35.0],
  na: [-22.0, 17.0],
  nc: [-21.5, 165.5],
  ne: [16.0, 8.0],
  nf: [-29.0333, 167.95],
  ng: [10.0, 8.0],
  ni: [13.0, -85.0],
  nl: [52.5, 5.75],
  no: [62.0, 10.0],
  np: [28.0, 84.0],
  nr: [-0.5333, 166.9167],
  nu: [-19.0333, -169.8667],
  nz: [-41.0, 174.0],
  om: [21.0, 57.0],
  pa: [9.0, -80.0],
  pe: [-10.0, -76.0],
  pf: [-15.0, -140.0],
  pg: [-6.0, 147.0],
  ph: [13.0, 122.0],
  pk: [30.0, 70.0],
  pl: [52.0, 20.0],
  pm: [46.8333, -56.3333],
  pr: [18.25, -66.5],
  ps: [32.0, 35.25],
  pt: [39.5, -8.0],
  pw: [7.5, 134.5],
  py: [-23.0, -58.0],
  qa: [25.5, 51.25],
  re: [-21.1, 55.6],
  ro: [46.0, 25.0],
  rs: [44.0, 21.0],
  ru: [60.0, 100.0],
  rw: [-2.0, 30.0],
  sa: [25.0, 45.0],
  sb: [-8.0, 159.0],
  sc: [-4.5833, 55.6667],
  sd: [15.0, 30.0],
  se: [62.0, 15.0],
  sg: [1.3667, 103.8],
  sh: [-15.9333, -5.7],
  si: [46.0, 15.0],
  sj: [78.0, 20.0],
  sk: [48.6667, 19.5],
  sl: [8.5, -11.5],
  sm: [43.7667, 12.4167],
  sn: [14.0, -14.0],
  so: [10.0, 49.0],
  sr: [4.0, -56.0],
  st: [1.0, 7.0],
  sv: [13.8333, -88.9167],
  sy: [35.0, 38.0],
  sz: [-26.5, 31.5],
  tc: [21.75, -71.5833],
  td: [15.0, 19.0],
  tf: [-43.0, 67.0],
  tg: [8.0, 1.1667],
  th: [15.0, 100.0],
  tj: [39.0, 71.0],
  tk: [-9.0, -172.0],
  tm: [40.0, 60.0],
  tn: [34.0, 9.0],
  to: [-20.0, -175.0],
  tr: [39.0, 35.0],
  tt: [11.0, -61.0],
  tv: [-8.0, 178.0],
  tw: [23.5, 121.0],
  tz: [-6.0, 35.0],
  ua: [49.0, 32.0],
  ug: [1.0, 32.0],
  um: [19.2833, 166.6],
  us: [38.0, -97.0],
  uy: [-33.0, -56.0],
  uz: [41.0, 64.0],
  va: [41.9, 12.45],
  vc: [13.25, -61.2],
  ve: [8.0, -66.0],
  vg: [18.5, -64.5],
  vi: [18.3333, -64.8333],
  vn: [16.0, 106.0],
  vu: [-16.0, 167.0],
  wf: [-13.3, -176.2],
  ws: [-13.5833, -172.3333],
  ye: [15.0, 48.0],
  yt: [-12.8333, 45.1667],
  za: [-29.0, 24.0],
  zm: [-15.0, 30.0],
  zw: [-20.0, 30.0],
};

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
    .send({ token, refresh_token: refreshToken });
  return { token: res.body.token };
}

async function _login(username, password) {
  const res = await request
    .post('https://www.services.renault-ze.com/api/user/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({ username, password });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }

  if (res.body.user.associated_vehicles.length > 1) {
    throw Error('More than one VIN number detected.');
  }

  // Set state to be persisted
  return {
    token: res.body.token,
    refreshToken: res.body.refresh_token,
    vin: res.body.user.associated_vehicles[0].VIN,
    countryISO2: res.body.user.country,
  };
}

async function connect({ requestLogin }) {
  // Here we can request credentials etc..

  // Here we can use two functions to invoke screens
  // requestLogin() or requestWebView()
  const { username, password } = await requestLogin();
  return {
    version: VERSION,
    ...(await _login(username, password)),
  };
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function collect(state = {}, logger, utils) {
  const { vin, version, countryISO2 } = state;

  // Perform migrations
  if (!version || version < 2) {
    utils.deleteAllActivities();
    state.lastFullyCollectedMonth = null;
  }

  if (!countryISO2) {
    throw Error('countryISO2 is missing from state');
  }
  const startMonth = state.lastFullyCollectedMonth || moment().subtract(2, 'year').format('MMYY');
  const endMonth = moment().format('MMYY');
  // Subtract one month to make sure we always have a full month
  const lastFullyCollectedMonth = moment().subtract(1, 'month').format('MMYY');

  // TODO: Describe conditions under which `connect` should be called upon failure
  const newState = {
    ...state,
    countryISO2,
    lastFullyCollectedMonth,
    version: VERSION,
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
      const text = await res.text();
      throw new HTTPError(text, res.status);
    }
  }

  if (res.status === 204) {
    // No content, `res.body` will be null
    return { activities: [], state: newState };
  }

  // Estimate where the car is located
  // TODO(olc): Use the car's geolocation?
  const [locationLat, locationLon] = COUNTRY_CODE_TO_LATLON[countryISO2.toLowerCase()];

  /* Look at charge events that are between `type = "START_NOTIFICATION"`
     and `type = "END_NOTIFICATION"`
  */
  const activities = [];
  res.body.reverse().forEach((d, i) => {
    if (i === 0) {
      return;
    }
    const prev = res.body[i - 1];
    if (d.type === 'END_NOTIFICATION' && prev.type === 'START_NOTIFICATION') {
      const start = moment(prev.date);
      const end = moment(d.date);
      const energyDeltaWattHours = ((d.charge_level - prev.charge_level) / 100.0) * BATTERY_SIZE;
      if (energyDeltaWattHours <= 0) {
        logger.logWarning(`Invalid energy delta measurement of ${energyDeltaWattHours}Wh obtained`);
      } else {
        activities.push({
          id: `renaultzoe${start.toISOString()}`,
          activityType: ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
          datetime: start.toDate(),
          endDatetime: end.toDate() - start.toDate() <= 0 ? null : end.toDate(),
          energyWattHours: energyDeltaWattHours,
          locationLon,
          locationLat,
        });
      }
    }
  });

  return { activities, state: newState };
}

const config = {
  id: 'renault-zoe',
  label: 'Renault Zoé',
  description: 'collects vehicle charging hours',
  type: ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
  isPrivate: true,
  // minRefreshInterval: 60
};

export default {
  connect,
  disconnect,
  collect,
  config,
};
