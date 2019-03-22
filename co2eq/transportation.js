import {
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_BUS,
  TRANSPORTATION_MODE_TRAIN,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
} from '../definitions';

import flightEmissions from './flights';

export const modelVersion = 4;

/*
Carbon intensity of transportation (kgCO2 per passenger and per km)
*/
function carbonIntensity(mode) {
  // We use a very crude version of
  // https://www.ipcc.ch/ipccreports/sres/aviation/125.htm#tab85
  switch (mode) {
    case TRANSPORTATION_MODE_BUS:
      return 15 / 1000.0;
    case TRANSPORTATION_MODE_CAR:
      return 50 / 1000.0;
    case TRANSPORTATION_MODE_TRAIN:
      return 20 / 1000.0;
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
      // Average of train and bus
      return (0.5 * carbonIntensity(TRANSPORTATION_MODE_TRAIN)
        + 0.5 * carbonIntensity(TRANSPORTATION_MODE_BUS));
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

function durationToDistance(durationHours, mode) {
  switch (mode) {
    case TRANSPORTATION_MODE_BUS:
      return durationHours * 50.0;
    case TRANSPORTATION_MODE_CAR:
      return durationHours * 80.0;
    case TRANSPORTATION_MODE_TRAIN:
      return durationHours * 80.0;
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
      // Average of train and bus
      return (0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_TRAIN)
        + 0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_BUS));
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  if (activity.transportationMode === TRANSPORTATION_MODE_PLANE) {
    return flightEmissions(activity);
  }
  // for non-plane activity types, computation is based on activity duration
  if (!activity.durationHours || activity.durationHours <= 0) {
    return null;
  }
  const distance = durationToDistance(activity.durationHours, activity.transportationMode);
  return carbonIntensity(activity.transportationMode) * distance;
}
