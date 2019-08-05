import moment from 'moment';

import { ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING } from '../../definitions';
import { HTTPError } from '../utils/errors';

const BASE_URL = 'https://creators.teslacockpit.com';

async function requestToken(username, password) {
  const res = await fetch(`${BASE_URL}/Account/TeslaLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-control': 'no-cache',
    },
    body: JSON.stringify({
      TeslaLogin: username,
      TeslaPassword: password,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }
  const data = await res.json();
  if (!data.length) {
    throw new Error('No API token were found in response');
  }
  return data[0].CreatorToken;
}

async function connect(requestLogin, requestWebView) {
  const { username, password } = await requestLogin();
  // Try to login, but don't save the token as it has an expiry date
  await requestToken(username, password);
  return { username, password };
}

function disconnect() {
  // Here we should do any cleanup (deleting tokens etc..)
  return {};
}

async function fetchVehicleCharges(token, vehicleId) {
  const res = await fetch(`${BASE_URL}/Vehicle/Charges/${vehicleId}`, {
    headers: {
      Authorization: token,
      'Cache-control': 'no-cache',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }
  const data = await res.json();
  return data;
}
async function fetchVehicleInfo(token) {
  const res = await fetch(`${BASE_URL}/Account/Vehicles`, {
    headers: {
      Authorization: token,
      'Cache-control': 'no-cache',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new HTTPError(text, res.status);
  }
  const data = await res.json();
  return data;
}

async function collect(state, logger, utils) {
  const { username, password } = state;
  const token = await requestToken(username, password);
  // Get timezone of vehicle
  const vehicles = await fetchVehicleInfo(token);
  if (!vehicles.length) {
    throw new Error('No vehicles found');
  }
  const vehicle = vehicles[0];
  const timezone = /\+\d\d:\d\d/.exec(vehicle.TimeZoneDisplayName); // +01:00
  const vehicleId = vehicle.VehicleID;

  const data = await fetchVehicleCharges(token, vehicleId);
  const activities = data.map((d) => {
    if (d.ChargeEndDate === '') {
      // Skip that element
      logger.logWarning('Skipping item as it has no ChargeEndDate');
      return null;
    }

    const startMoment = moment(`${d.ChargeStartDate} ${timezone}`, 'DD/MM/YYYY HH:mm Z');
    const endMoment = moment(`${d.ChargeEndDate} ${timezone}`, 'DD/MM/YYYY HH:mm Z');
    let efficiency = parseFloat(d.Efficiency.replace(',', '.').replace(' %', '')) / 100.0;

    if (efficiency <= 0.8 || efficiency > 1) {
      logger.logWarning(`Invalid efficiency ${efficiency} received. Defaulting to 1 instead.`);
      efficiency = 1;
    }

    const energyWattHours = parseFloat(d.ChargeJuice.replace(',', '.')) / efficiency * 1000;
    if (energyWattHours <= 0) {
      logger.logWarning(`Invalid ChargeJuice ${d.ChargeJuice} received. Ignoring..`);
      return null;
    }

    if (!startMoment.isValid()) {
      logger.logError(`Invalid startDate ${d.ChargeStartDate}`);
    }

    const [locationLat, locationLon] = [
      parseFloat(d.ChargerLatitude),
      parseFloat(d.ChargerLongitude),
    ];

    if (!Number.isFinite(locationLat) || !Number.isFinite(locationLon)) {
      throw new Error(`Could not parse location. Input was lon=${d.ChargerLongitude}, lat=${d.ChargerLatitude}. Output was lon=${locationLon}, lat=${locationLat}`);
    }

    return {
      id: `teslacockpit${startMoment.toISOString()}`,
      activityType: ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
      datetime: startMoment.toDate(),
      durationHours: endMoment.diff(startMoment, 'minutes') / 60.0,
      energyWattHours,
      locationLat,
      locationLon,
    };
  });

  return { activities: activities.filter(a => a), state };
}

const config = {
  contributors: ['corradio'],
  label: 'Tesla Cockpit',
  signupLink: 'https://beta.teslacockpit.com/',
  description: 'collects vehicle charging activities',
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
