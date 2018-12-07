import moment from 'moment';
import request from 'superagent';

import { ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING } from '../../../constants';

const VERSION = 1;

const EXPIRED_TOKEN_MESSAGE = 'com.worldline.renault.myzeonline.exception.InvalidAuthenticationException.ExpiredToken';
const BATTERY_SIZE = 22000; // in Wh

/*
  Doc: https://shkspr.mobi/blog/2016/10/reverse-engineering-the-renault-zoe-api/
*/

// https://gist.github.com/sindresorhus/1341699
// eslint-disable-next-line
const COUNTRY_CODE_TO_LATLON = {"ad":["42.5000","1.5000"],"ae":["24.0000","54.0000"],"af":["33.0000","65.0000"],"ag":["17.0500","-61.8000"],"ai":["18.2500","-63.1667"],"al":["41.0000","20.0000"],"am":["40.0000","45.0000"],"an":["12.2500","-68.7500"],"ao":["-12.5000","18.5000"],"ap":["35.0000","105.0000"],"aq":["-90.0000","0.0000"],"ar":["-34.0000","-64.0000"],"as":["-14.3333","-170.0000"],"at":["47.3333","13.3333"],"au":["-27.0000","133.0000"],"aw":["12.5000","-69.9667"],"az":["40.5000","47.5000"],"ba":["44.0000","18.0000"],"bb":["13.1667","-59.5333"],"bd":["24.0000","90.0000"],"be":["50.8333","4.0000"],"bf":["13.0000","-2.0000"],"bg":["43.0000","25.0000"],"bh":["26.0000","50.5500"],"bi":["-3.5000","30.0000"],"bj":["9.5000","2.2500"],"bm":["32.3333","-64.7500"],"bn":["4.5000","114.6667"],"bo":["-17.0000","-65.0000"],"br":["-10.0000","-55.0000"],"bs":["24.2500","-76.0000"],"bt":["27.5000","90.5000"],"bv":["-54.4333","3.4000"],"bw":["-22.0000","24.0000"],"by":["53.0000","28.0000"],"bz":["17.2500","-88.7500"],"ca":["60.0000","-95.0000"],"cc":["-12.5000","96.8333"],"cd":["0.0000","25.0000"],"cf":["7.0000","21.0000"],"cg":["-1.0000","15.0000"],"ch":["47.0000","8.0000"],"ci":["8.0000","-5.0000"],"ck":["-21.2333","-159.7667"],"cl":["-30.0000","-71.0000"],"cm":["6.0000","12.0000"],"cn":["35.0000","105.0000"],"co":["4.0000","-72.0000"],"cr":["10.0000","-84.0000"],"cu":["21.5000","-80.0000"],"cv":["16.0000","-24.0000"],"cx":["-10.5000","105.6667"],"cy":["35.0000","33.0000"],"cz":["49.7500","15.5000"],"de":["51.0000","9.0000"],"dj":["11.5000","43.0000"],"dk":["56.0000","10.0000"],"dm":["15.4167","-61.3333"],"do":["19.0000","-70.6667"],"dz":["28.0000","3.0000"],"ec":["-2.0000","-77.5000"],"ee":["59.0000","26.0000"],"eg":["27.0000","30.0000"],"eh":["24.5000","-13.0000"],"er":["15.0000","39.0000"],"es":["40.0000","-4.0000"],"et":["8.0000","38.0000"],"eu":["47.0000","8.0000"],"fi":["64.0000","26.0000"],"fj":["-18.0000","175.0000"],"fk":["-51.7500","-59.0000"],"fm":["6.9167","158.2500"],"fo":["62.0000","-7.0000"],"fr":["46.0000","2.0000"],"ga":["-1.0000","11.7500"],"gb":["54.0000","-2.0000"],"gd":["12.1167","-61.6667"],"ge":["42.0000","43.5000"],"gf":["4.0000","-53.0000"],"gh":["8.0000","-2.0000"],"gi":["36.1833","-5.3667"],"gl":["72.0000","-40.0000"],"gm":["13.4667","-16.5667"],"gn":["11.0000","-10.0000"],"gp":["16.2500","-61.5833"],"gq":["2.0000","10.0000"],"gr":["39.0000","22.0000"],"gs":["-54.5000","-37.0000"],"gt":["15.5000","-90.2500"],"gu":["13.4667","144.7833"],"gw":["12.0000","-15.0000"],"gy":["5.0000","-59.0000"],"hk":["22.2500","114.1667"],"hm":["-53.1000","72.5167"],"hn":["15.0000","-86.5000"],"hr":["45.1667","15.5000"],"ht":["19.0000","-72.4167"],"hu":["47.0000","20.0000"],"id":["-5.0000","120.0000"],"ie":["53.0000","-8.0000"],"il":["31.5000","34.7500"],"in":["20.0000","77.0000"],"io":["-6.0000","71.5000"],"iq":["33.0000","44.0000"],"ir":["32.0000","53.0000"],"is":["65.0000","-18.0000"],"it":["42.8333","12.8333"],"jm":["18.2500","-77.5000"],"jo":["31.0000","36.0000"],"jp":["36.0000","138.0000"],"ke":["1.0000","38.0000"],"kg":["41.0000","75.0000"],"kh":["13.0000","105.0000"],"ki":["1.4167","173.0000"],"km":["-12.1667","44.2500"],"kn":["17.3333","-62.7500"],"kp":["40.0000","127.0000"],"kr":["37.0000","127.5000"],"kw":["29.3375","47.6581"],"ky":["19.5000","-80.5000"],"kz":["48.0000","68.0000"],"la":["18.0000","105.0000"],"lb":["33.8333","35.8333"],"lc":["13.8833","-61.1333"],"li":["47.1667","9.5333"],"lk":["7.0000","81.0000"],"lr":["6.5000","-9.5000"],"ls":["-29.5000","28.5000"],"lt":["56.0000","24.0000"],"lu":["49.7500","6.1667"],"lv":["57.0000","25.0000"],"ly":["25.0000","17.0000"],"ma":["32.0000","-5.0000"],"mc":["43.7333","7.4000"],"md":["47.0000","29.0000"],"me":["42.0000","19.0000"],"mg":["-20.0000","47.0000"],"mh":["9.0000","168.0000"],"mk":["41.8333","22.0000"],"ml":["17.0000","-4.0000"],"mm":["22.0000","98.0000"],"mn":["46.0000","105.0000"],"mo":["22.1667","113.5500"],"mp":["15.2000","145.7500"],"mq":["14.6667","-61.0000"],"mr":["20.0000","-12.0000"],"ms":["16.7500","-62.2000"],"mt":["35.8333","14.5833"],"mu":["-20.2833","57.5500"],"mv":["3.2500","73.0000"],"mw":["-13.5000","34.0000"],"mx":["23.0000","-102.0000"],"my":["2.5000","112.5000"],"mz":["-18.2500","35.0000"],"na":["-22.0000","17.0000"],"nc":["-21.5000","165.5000"],"ne":["16.0000","8.0000"],"nf":["-29.0333","167.9500"],"ng":["10.0000","8.0000"],"ni":["13.0000","-85.0000"],"nl":["52.5000","5.7500"],"no":["62.0000","10.0000"],"np":["28.0000","84.0000"],"nr":["-0.5333","166.9167"],"nu":["-19.0333","-169.8667"],"nz":["-41.0000","174.0000"],"om":["21.0000","57.0000"],"pa":["9.0000","-80.0000"],"pe":["-10.0000","-76.0000"],"pf":["-15.0000","-140.0000"],"pg":["-6.0000","147.0000"],"ph":["13.0000","122.0000"],"pk":["30.0000","70.0000"],"pl":["52.0000","20.0000"],"pm":["46.8333","-56.3333"],"pr":["18.2500","-66.5000"],"ps":["32.0000","35.2500"],"pt":["39.5000","-8.0000"],"pw":["7.5000","134.5000"],"py":["-23.0000","-58.0000"],"qa":["25.5000","51.2500"],"re":["-21.1000","55.6000"],"ro":["46.0000","25.0000"],"rs":["44.0000","21.0000"],"ru":["60.0000","100.0000"],"rw":["-2.0000","30.0000"],"sa":["25.0000","45.0000"],"sb":["-8.0000","159.0000"],"sc":["-4.5833","55.6667"],"sd":["15.0000","30.0000"],"se":["62.0000","15.0000"],"sg":["1.3667","103.8000"],"sh":["-15.9333","-5.7000"],"si":["46.0000","15.0000"],"sj":["78.0000","20.0000"],"sk":["48.6667","19.5000"],"sl":["8.5000","-11.5000"],"sm":["43.7667","12.4167"],"sn":["14.0000","-14.0000"],"so":["10.0000","49.0000"],"sr":["4.0000","-56.0000"],"st":["1.0000","7.0000"],"sv":["13.8333","-88.9167"],"sy":["35.0000","38.0000"],"sz":["-26.5000","31.5000"],"tc":["21.7500","-71.5833"],"td":["15.0000","19.0000"],"tf":["-43.0000","67.0000"],"tg":["8.0000","1.1667"],"th":["15.0000","100.0000"],"tj":["39.0000","71.0000"],"tk":["-9.0000","-172.0000"],"tm":["40.0000","60.0000"],"tn":["34.0000","9.0000"],"to":["-20.0000","-175.0000"],"tr":["39.0000","35.0000"],"tt":["11.0000","-61.0000"],"tv":["-8.0000","178.0000"],"tw":["23.5000","121.0000"],"tz":["-6.0000","35.0000"],"ua":["49.0000","32.0000"],"ug":["1.0000","32.0000"],"um":["19.2833","166.6000"],"us":["38.0000","-97.0000"],"uy":["-33.0000","-56.0000"],"uz":["41.0000","64.0000"],"va":["41.9000","12.4500"],"vc":["13.2500","-61.2000"],"ve":["8.0000","-66.0000"],"vg":["18.5000","-64.5000"],"vi":["18.3333","-64.8333"],"vn":["16.0000","106.0000"],"vu":["-16.0000","167.0000"],"wf":["-13.3000","-176.2000"],"ws":["-13.5833","-172.3333"],"ye":["15.0000","48.0000"],"yt":["-12.8333","45.1667"],"za":["-29.0000","24.0000"],"zm":["-15.0000","30.0000"],"zw":["-20.0000","30.0000"]};

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

async function connect(requestLogin, requestWebView) {
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
  const {
    username, password, vin, version,
  } = state;

  // Perform migrations
  if (version < 1) {
    utils.deleteAllActivities();
    state.lastFullyCollectedMonth = null;
  }

  let { countryISO2 } = state;
  if (!countryISO2) {
    // Force a login to get the country
    const loginState = await _login(username, password);
    countryISO2 = loginState.countryISO2;
    if (!countryISO2) {
      throw Error('Unable to obtain user country');
    }
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
      throw new Error(e);
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
    if (i === 0) { return; }
    const prev = res.body[i - 1];
    if (d.type === 'END_NOTIFICATION' && prev.type === 'START_NOTIFICATION') {
      const start = moment(prev.date);
      const end = moment(d.date);
      const duration = end.valueOf() - start.valueOf(); // in ms
      const energyDeltaWattHours = (d.charge_level - prev.charge_level) / 100.0 * BATTERY_SIZE;
      if (energyDeltaWattHours <= 0) {
        logger.logWarning(`Invalid energy delta measurement of ${energyDeltaWattHours}Wh obtained`);
      } else {
        activities.push({
          id: `renaultzoe${start.toISOString()}`,
          activityType: ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
          datetime: start.toDate(),
          durationHours: duration / 1000.0 / 3600.0,
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
