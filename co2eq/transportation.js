import {
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_BUS,
  TRANSPORTATION_MODE_TRAIN,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  TRANSPORTATION_MODE_FERRY,
  TRANSPORTATION_MODE_BIKE,
} from '../definitions';

import flightEmissions from './flights';
import { carbonEmissions as purchaseCarbonEmissions } from './purchase';

export const modelVersion = 6;

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
      return (
        0.5 * carbonIntensity(TRANSPORTATION_MODE_TRAIN)
        + 0.5 * carbonIntensity(TRANSPORTATION_MODE_BUS)
      );
    case TRANSPORTATION_MODE_FERRY:
      // See https://en.wikipedia.org/wiki/Carbon_footprint
      return 0.12;
    case TRANSPORTATION_MODE_BIKE:
      // https://ecf.com/files/wp-content/uploads/ECF_BROCHURE_EN_planche.pdf
      return 5 / 1000.0;
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

export function durationToDistance(durationHours, mode) {
  switch (mode) {
    case TRANSPORTATION_MODE_BUS:
      return durationHours * 50.0;
    case TRANSPORTATION_MODE_CAR:
      return durationHours * 80.0;
    case TRANSPORTATION_MODE_TRAIN:
      return durationHours * 80.0;
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
      // Average of train and bus
      return (
        0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_TRAIN)
        + 0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_BUS)
      );
    case TRANSPORTATION_MODE_FERRY:
      return durationHours * 30; // ~16 knots
    case TRANSPORTATION_MODE_BIKE:
      return durationHours * 10;
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  const {
    transportationMode,
    durationHours,
    costEuros,
    purchaseCategory,
    passengerCount,
  } = activity;
  let { distanceKilometers } = activity;

  // Plane-specific model
  if (transportationMode === TRANSPORTATION_MODE_PLANE) {
    return flightEmissions(activity);
  }

  if (!distanceKilometers && (activity.durationHours || 0) > 0) {
    // fallback on duration if available
    distanceKilometers = durationToDistance(durationHours, transportationMode);
  }

  if (distanceKilometers) {
    // Take into account the passenger count if this is a car
    if (transportationMode === TRANSPORTATION_MODE_CAR) {
      return (
        (carbonIntensity(transportationMode) * distanceKilometers)
        / (passengerCount || 1)
      );
    }
    return carbonIntensity(transportationMode) * distanceKilometers;
  } if (costEuros && purchaseCategory) {
    // If this came from a purchase
    return purchaseCarbonEmissions(activity);
  }
  return null;
}
