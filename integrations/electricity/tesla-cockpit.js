import moment from 'moment';

import { ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING } from '../../definitions';

const BASE_URL = 'https://creators.teslacockpit.com';

async function connect(requestLogin, requestWebView) {
  const { username, password } = await requestLogin();
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
    throw new Error(`HTTP error ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (!data.length) {
    throw new Error('No API token were found in response');
  }
  return { token: data[0].APIToken };
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
    throw new Error(`HTTP error ${res.status}: ${text}`);
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
    throw new Error(`HTTP error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data;
}

async function collect(state, logger, utils) {
  const { token } = state;
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

    return {
      id: `teslacockpit${startMoment.toISOString()}`,
      activityType: ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
      datetime: startMoment.toDate(),
      durationHours: endMoment.diff(startMoment, 'minutes') / 60.0,
      energyWattHours,
      locationLat: parseFloat(d.ChargerLatitude),
      locationLon: parseFloat(d.ChargerLongitude),
    };
  });

  return { activities: activities.filter(a => a) };
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
