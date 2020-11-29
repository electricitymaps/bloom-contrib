import flatten from 'lodash/flatten';
import moment from 'moment';

import {
  ACTIVITY_TYPE_PURCHASE,
  ACTIVITY_TYPE_TRANSPORTATION,
  PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL,
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_TRAIN,
  UNIT_ITEM,
} from '../../definitions';
import { OAuthManager } from '../authentication';
import env from '../loadEnv';
import { HTTPError } from '../utils/errors';

const config = {
  id: 'tripit',
  label: 'TripIt',
  description: 'collects plane, train and hotel activities from your emails',
  type: ACTIVITY_TYPE_TRANSPORTATION,
  isPrivate: true,
  // minRefreshInterval: 60
  version: 1,
};

const manager = new OAuthManager({
  baseUrl: 'https://api.tripit.com',
  consumerKey: env.TRIPIT_CONSUMER_KEY,
  consumerSecret: env.TRIPIT_CONSUMER_SECRET,
  requestTokenUrl: 'https://api.tripit.com/oauth/request_token',
  authorizeUrl: 'https://m.tripit.com/oauth/authorize',
  accessTokenUrl: 'https://api.tripit.com/oauth/access_token',
});

function convertNanToNull(number) {
  if (typeof number === 'number' && !Number.isFinite(number)) {
    return null;
  }
  return number;
}

function parseDatetime(tripItDatetime) {
  if (tripItDatetime.date && tripItDatetime.time && tripItDatetime.utc_offset) {
    return moment(
      `${tripItDatetime.date}T${tripItDatetime.time}${tripItDatetime.utc_offset}`
    ).toDate();
  }
  if (tripItDatetime.date) {
    console.warn(
      `Local time assumed because no timezone could be parsed from ${JSON.stringify(
        tripItDatetime
      )}.`
    );
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
    throw new HTTPError(text, res.status);
  }
  const data = await res.json();
  const pageNum = parseInt(data.page_num, 10);
  const pageMax = parseInt(data.max_page, 10);

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
        if (s.stops && !['nonstop', 'NON STOP'].includes(s.stops)) {
          throw new Error(`Unexpected stops "${s.stops}". Expected "nonstop".`);
        }
        return {
          id: s.id,
          activityType: ACTIVITY_TYPE_TRANSPORTATION,
          transportationMode: TRANSPORTATION_MODE_PLANE,
          datetime: parseDatetime(s.StartDateTime),
          endDatetime:
            parseDatetime(s.EndDateTime) <= parseDatetime(s.StartDateTime)
              ? null
              : parseDatetime(s.EndDateTime),
          // distanceKilometers: s.distance && parseInt(s.distance.replace(' km', '').replace(',', '.'), 10),
          // distance is not reliable unfortunately
          distanceKilometers: null,
          carrier: s.marketing_airline,
          departureAirportCode: s.start_airport_code,
          destinationAirportCode: s.end_airport_code,
          bookingClass: s.service_class && s.service_class,
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
    throw new HTTPError(text, res.status);
  }
  const data = await res.json();
  const pageNum = parseInt(data.page_num, 10);
  const pageMax = parseInt(data.max_page, 10);

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
        const [startDate, endDate] = [parseDatetime(s.StartDateTime), parseDatetime(s.EndDateTime)];
        return {
          id: s.id,
          activityType: ACTIVITY_TYPE_TRANSPORTATION,
          transportationMode: TRANSPORTATION_MODE_TRAIN,
          datetime: startDate,
          endDatetime: endDate.getTime() - startDate.getTime() <= 0 ? null : endDate,
          distanceKilometers:
            s.distance && parseInt(s.distance.replace(' km', '').replace(',', '.'), 10),
          carrier: s.carrier_name,
          departureStation: s.start_station_name,
          destinationStation: s.end_station_name,
          bookingClass: s.service_class,
        };
      } catch (e) {
        logger.logWarning(`Skipping item having error: ${e}`);
        return null;
      }
    });
  });

  return { activities: flatten(activities), modifiedSince: data.timestamp };
}

async function fetchLodging(modifiedSince, isPast = true, logger) {
  const url = modifiedSince
    ? `/v1/list/object/type/lodging/past/${isPast}/format/json/modified_since/${modifiedSince}`
    : `/v1/list/object/type/lodging/past/${isPast}/format/json`;
  const res = await manager.fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }
  const data = await res.json();
  const pageNum = parseInt(data.page_num, 10);
  const pageMax = parseInt(data.max_page, 10);

  if (pageMax > pageNum) {
    throw Error('Not implemented pagination is required');
  }

  let objects = data.LodgingObject;
  if (!objects) {
    return { activities: [], modifiedSince: data.timestamp };
  }
  if (!Array.isArray(objects)) {
    objects = [objects];
  }

  const activities = objects.map((s) => {
    try {
      const [startDate, endDate] = [parseDatetime(s.StartDateTime), parseDatetime(s.EndDateTime)];
      if (s.number_rooms != null && parseInt(s.number_rooms, 10) !== 1) {
        logger.logWarning(`Skipping item having multiple rooms: ${JSON.stringify(s)}`);
        return null;
      }
      // TODO: We could also parse currency
      // Data given: total_cost: "£154.07"
      const locationLon = s.Address ? parseFloat(s.Address.longitude) : null;
      const locationLat = s.Address ? parseFloat(s.Address.latitude) : null;
      const participants = s.number_guests ? parseInt(s.number_guests, 10) : null;
      return {
        id: s.id,
        activityType: ACTIVITY_TYPE_PURCHASE,
        lineItems: [
          { identifier: PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL, unit: UNIT_ITEM, value: 1 },
        ],
        countryCodeISO2: s.Address ? s.Address.country : null,
        locationLon: convertNanToNull(locationLon),
        locationLat: convertNanToNull(locationLat),
        locationLabel: s.display_name,
        label: s.display_name,
        carrier: s.booking_site_name,
        datetime: startDate,
        endDatetime: endDate.getTime() - startDate.getTime() <= 0 ? null : endDate,
        participants: convertNanToNull(participants),
      };
    } catch (e) {
      logger.logWarning(`Skipping item having error: ${e}`);
      return null;
    }
  });
  return { activities, modifiedSince: data.timestamp };
}

async function connect({ requestWebView }) {
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

  const oldVersion = state.version || 0;

  manager.setState(state);

  logger.logDebug(`Initiating collect() with lastModifiedSince=${state.lastModifiedSince}`);

  // Logding was introduced in version 1
  // so make sure we do a full fetch first time
  const logdgingLastModifiedSince = oldVersion < 1 ? null : state.lastModifiedSince;

  const allResults = await Promise.all([
    fetchAir(state.lastModifiedSince, true, logger), // past
    fetchAir(state.lastModifiedSince, false, logger), // future
    fetchRail(state.lastModifiedSince, true, logger), // past
    fetchRail(state.lastModifiedSince, false, logger), // future
    fetchLodging(logdgingLastModifiedSince, true, logger), // past
    fetchLodging(logdgingLastModifiedSince, false, logger), // future
  ]);

  return {
    activities: flatten(allResults.map((d) => d.activities)).filter((d) => d),
    state: {
      ...state,
      lastModifiedSince: Math.max(...allResults.map((d) => d.modifiedSince)),
      version: config.version,
    },
  };
}

export default {
  connect,
  disconnect,
  collect,
  config,
};
