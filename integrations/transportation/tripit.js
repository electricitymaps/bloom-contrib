import moment from 'moment';
import flatten from 'lodash/flatten';

import env from '../loadEnv';
import { OAuthManager } from '../authentication';
import {
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_TRAIN,
} from '../../definitions';
import { HTTPError } from '../utils/errors';

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
    throw new HTTPError(text, res.status);
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
    throw new HTTPError(text, res.status);
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

/* async function fetchLodging(modifiedSince, isPast = true, logger) {
  const url = modifiedSince
    ? `/v1/list/object/type/lodging/past/${isPast}/format/json/modified_since/${modifiedSince}`
    : `/v1/list/object/type/lodging/past/${isPast}/format/json`;
  const res = await manager.fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }
  const data = await res.json();
  const pageNum = parseInt(data['page_num'], 10);
  const pageMax = parseInt(data['max_page'], 10);

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
*/
/*
Address:
  address: "Værkmestergade 2, Aarhus, 8000, DK"
  city: "Aarhus"
  country: "DK"
  latitude: "56.150338"
  longitude: "10.209409"
  zip: "8000"
  __proto__: Object
  EndDateTime:
  date: "2019-08-19"
  time: "12:00:00"
  timezone: "Europe/Copenhagen"
  utc_offset: "+02:00"
  __proto__: Object
  Guest:
  first_name: "Martin"
  frequent_traveler_supplier: "Comwell Aarhus"
  last_name: "Collignon"
  __proto__: Object
  StartDateTime:
  date: "2019-08-18"
  time: "15:00:00"
  timezone: "Europe/Copenhagen"
  utc_offset: "+02:00"
  __proto__: Object
  booking_site_conf_num: "8077470562193"
  booking_site_name: "Hotels.com"
  booking_site_phone: "1 866 372 4937"
  booking_site_url: "http://www.hotels.com/"
  display_name: "Comwell Aarhus"
  id: "1078626361"
  is_client_traveler: "true"
  is_display_name_auto_generated: "true"
  is_purchased: "true"
  is_tripit_booking: "false"
  last_modified: "1568495673"
  number_guests: "1"
  number_rooms: "1"
  relative_url: "/reservation/show/id/1078626361"
  restrictions: "Gratis afbestilling indtil 18.08.2019 Hvis du ændrer eller afbestiller din reservation efter 16:00, 18.08.2019 (GMT+02:00), vil du blive opkrævet betaling for 1 overnatning (inklusive skat) Vi udsteder ikke tilbagebetaling ved manglende fremmøde eller tidlig udtjekning."
  room_type: "Corner Room"
  supplier_conf_num: "8077470562193"
  supplier_name: "Comwell Aarhus"
  supplier_phone: "+4586728000"
  total_cost: "£154.07"
  trip_id: "283707483"
*/

/*  const activities = objects;/*objects.map((d) => {
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
*/

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
    /* fetchLodging(state.lastModifiedSince, true, logger), // past
    fetchLodging(state.lastModifiedSince, false, logger), // future */
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
