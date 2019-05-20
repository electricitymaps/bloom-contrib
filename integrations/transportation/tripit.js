import moment from 'moment';
import flatten from 'lodash/flatten';

import env from '../utils/loadenv';
import { OAuthManager } from '../utils/oauth';
import {
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_TRAIN,
} from '../../definitions';

const manager = new OAuthManager({
  baseUrl: 'https://api.tripit.com',
  consumerKey: env.TRIPIT_CONSUMER_KEY,
  consumerSecret: env.TRIPIT_CONSUMER_SECRET,
  requestTokenUrl: 'https://api.tripit.com/oauth/request_token',
  authorizeUrl: 'https://m.tripit.com/oauth/authorize',
  accessTokenUrl: 'https://api.tripit.com/oauth/access_token',
});

function parseDatetime(tripItDatetime) {
  if (tripItDatetime.date && tripItDatetime.time && tripItDatetime.utc_offset) {
    return moment(`${tripItDatetime.date}T${tripItDatetime.time}${tripItDatetime.utc_offset}`).toDate();
  }
  if (tripItDatetime.date) {
    console.warn(`Local time assumed because no timezone could be parsed from ${JSON.stringify(tripItDatetime)}.`);
    return moment(`${tripItDatetime.date}T00:00:00`).toDate();
  }
  throw Error(`Invalid date encountered: ${JSON.stringify(tripItDatetime)}`);
}

async function fetchAir(modifiedSince, isPast = true, logger) {
  const url = modifiedSince
    ? `/v1/list/object/type/air/past/${isPast}/format/json/modified_since/${modifiedSince}`
    : `/v1/list/object/type/air/past/${isPast}/format/json`;
  const res = await manager.fetch(url);
  if (!res.ok) {
    const text = await res.text();
    // throw new HTTPError(text, res.status);
    throw new Error(`HTTP error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const pageNum = parseInt(data['page_num'], 10);
  const pageMax = parseInt(data['max_page'], 10);

  if (pageMax > pageNum) {
    throw Error('Not implemented pagination is required');
  }

  let objects = data.AirObject;
  if (!objects) {
    return { activities: [], modifiedSince: data.timestamp };
  }
  if (!Array.isArray(objects)) {
    objects = [objects];
  }
  const activities = objects.map((d) => {
    const segments = Array.isArray(d.Segment) ? d.Segment : [d.Segment];
    // Iterate over all segments (legs) of this reservation
    return segments.map((s) => {
      try {
        const [startDate, endDate] = [
          parseDatetime(s.StartDateTime),
          parseDatetime(s.EndDateTime),
        ];
        if (s.stops && s.stops !== 'nonstop') {
          throw Error(`Unexpected stops "${s.stops}". Expected "nonstop".`);
        }
        const durationHours = (parseDatetime(s.EndDateTime).getTime() - parseDatetime(s.StartDateTime).getTime()) / 1000.0 / 3600.0;
        return {
          id: s.id,
          activityType: ACTIVITY_TYPE_TRANSPORTATION,
          transportationMode: TRANSPORTATION_MODE_PLANE,
          datetime: parseDatetime(s.StartDateTime),
          // distanceKilometers: s.distance && parseInt(s.distance.replace(' km', '').replace(',', '.'), 10),
          // distance is not reliable unfortunately
          distanceKilometers: null,
          durationHours: durationHours <= 0 ? null : durationHours,
          carrier: s['marketing_airline'],
          departureAirportCode: s['start_airport_code'],
          destinationAirportCode: s['end_airport_code'],
          bookingClass: s['service_class'] && s['service_class'],
        };
      } catch (e) {
        logger.logWarning(`Skipping item having error: ${e}`);
        return null;
      }
    });
  });

  return { activities: flatten(activities), modifiedSince: data.timestamp };
}

async function fetchRail(modifiedSince, isPast = true, logger) {
  const url = modifiedSince
    ? `/v1/list/object/type/rail/past/${isPast}/format/json/modified_since/${modifiedSince}`
    : `/v1/list/object/type/rail/past/${isPast}/format/json`;
  const res = await manager.fetch(url);
  if (!res.ok) {
    const text = await res.text();
    // throw new HTTPError(text, res.status);
    throw new Error(`HTTP error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const pageNum = parseInt(data['page_num'], 10);
  const pageMax = parseInt(data['max_page'], 10);

  if (pageMax > pageNum) {
    throw Error('Not implemented pagination is required');
  }

  let objects = data.RailObject;
  if (!objects) {
    return { activities: [], modifiedSince: data.timestamp };
  }
  if (!Array.isArray(objects)) {
    objects = [objects];
  }

  const activities = objects.map((d) => {
    const segments = Array.isArray(d.Segment) ? d.Segment : [d.Segment];
    // Iterate over all segments (legs) of this reservation
    return segments.map((s) => {
      try {
        const [startDate, endDate] = [
          parseDatetime(s.StartDateTime),
          parseDatetime(s.EndDateTime),
        ];
        const durationHours = (endDate.getTime() - startDate.getTime()) / 1000.0 / 3600.0;
        return {
          id: s.id,
          activityType: ACTIVITY_TYPE_TRANSPORTATION,
          transportationMode: TRANSPORTATION_MODE_TRAIN,
          datetime: startDate,
          distanceKilometers: s.distance && parseInt(s.distance.replace(' km', '').replace(',', '.'), 10),
          durationHours: durationHours <= 0 ? null : durationHours,
          carrier: s['carrier_name'],
          departureStation: s['start_station_name'],
          destinationStation: s['end_station_name'],
          bookingClass: s['service_class'],
        };
      } catch (e) {
        logger.logWarning(`Skipping item having error: ${e}`);
        return null;
      }
    });
  });

  return { activities: flatten(activities), modifiedSince: data.timestamp };
}

async function connect(requestLogin, requestWebView) {
  const state = await manager.authorize(requestWebView);
  return state;
}

async function disconnect() {
  return {};
}

async function collect(state = {}, logger) {
  /*
  API Documentation at http://tripit.github.io/api/doc/v1/index.html#method_list
  */

  manager.setState(state);

  logger.logDebug(`Initiating collect() with lastModifiedSince=${state.lastModifiedSince}`);

  const allResults = await Promise.all([
    fetchAir(state.lastModifiedSince, true, logger), // past
    fetchAir(state.lastModifiedSince, false, logger), // future
    fetchRail(state.lastModifiedSince, true, logger), // past
    fetchRail(state.lastModifiedSince, false, logger), // future
  ]);

  return {
    activities: flatten(allResults.map(d => d.activities)).filter(d => d),
    state: {
      ...state,
      lastModifiedSince: Math.max(...allResults.map(d => d.modifiedSince)),
    },
  };
}

const config = {
  label: 'TripIt',
  description: 'collects plane and train trips from your emails',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  isPrivate: true,
  // minRefreshInterval: 60
};


export default {
  connect,
  disconnect,
  collect,
  config,
};
