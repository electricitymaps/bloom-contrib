import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_CAR } from '../../definitions';
import cars from './cars.json';
import { getActivityDurationHours } from '../utils';

export const modelName = 'car';
export const modelVersion = '1';
export const explanation = {};

export const modelCanRunVersion = 2;
export function modelCanRun(activity) {
  const { activityType, transportationMode } = activity;
  if (
    activityType === ACTIVITY_TYPE_TRANSPORTATION &&
    transportationMode === TRANSPORTATION_MODE_CAR
  ) {
    return true;
  }
  return false;
}

// look up carbonIntensity by brand name
export function carbonIntensityByBrand(brand) {
  const entry = cars.footprints.find(d => d.brand === brand);
  if (!entry) {
    throw new Error(`Unknown brand name ${brand}`);
  } else {
    return entry.carbonIntensity;
  }
}

// look up carbon intensity for cars by Euro car segment and engine type,
// input can be null
function carbonIntensity(euroCarSegment, engineType, brand) {
  // Using == instead of === because we want undefined to match with null in cars.json
  // eslint-disable-next-line eqeqeq
  const entry = cars.footprints.find(
    d => d.euroCarSegment == euroCarSegment && d.engineType == engineType && d.brand == brand
  );
  if (!entry) {
    throw new Error(`Unknown size, type, or brand ${euroCarSegment}_${engineType}_${brand}`);
  }
  return entry.carbonIntensity;
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  let { distanceKilometers } = activity;
  if (!distanceKilometers) {
    // fallback on duration if available
    const durationHours = getActivityDurationHours(activity);
    if ((durationHours || 0) > 0) {
      // https://setis.ec.europa.eu/system/files/Driving_and_parking_patterns_of_European_car_drivers-a_mobility_survey.pdf
      distanceKilometers = durationHours * 45.0;
    } else {
      throw new Error(
        `Couldn't calculate carbonEmissions for activity because distanceKilometers = ${distanceKilometers} and datetime = ${activity.datetime} and endDatetime = ${activity.endDatetime}`
      );
    }
  }

  return (
    (carbonIntensity(activity.euroCarSegment, activity.engineType, activity.brand) *
      distanceKilometers) /
    (activity.participants || 1)
  );
}
