import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_FERRY } from '../../definitions';
import { getActivityDurationHours } from '../utils';
import ferries from './ferries.json'; // source: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019  -- tab: 'Business travel- sea'

export const modelName = 'ferry';
export const modelVersion = '1';
export const explanation = {};

export const modelCanRunVersion = 2; // not sure what number should come here
export function modelCanRun(activity) {
  const { activityType, transportationMode } = activity;
  if (
    activityType === ACTIVITY_TYPE_TRANSPORTATION &&
    transportationMode === TRANSPORTATION_MODE_FERRY
  ) {
    return true;
  }
  return false;
}

// look up carbon intensity for ferry depending on if it is a foot passenger or a passenger with a vehicle


function carbonIntensity(hasVehicle) {
  const entry = ferries.footprints.find(
    // Using == instead of === because we want undefined to match with null in const ferries
    d => d.withVehicle == hasVehicle
  );
  if (!entry) {
    throw new Error(`Unknown input for hasVehicle ${hasVehicle}`);
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
      // Acc. to Rome2rio, ferry from Menorca to Mallorca is 189.3km in 6h --> 31.55 km/h (https://www.rome2rio.com/map/Palma/Mahon-Airport-MAH) --> Rounding up to 30
      distanceKilometers = durationHours * 30.0; //avg speed 30 km/h
    } else {
      throw new Error(
        `Couldn't calculate carbonEmissions for activity because distanceKilometers = ${distanceKilometers} and datetime = ${activity.datetime} and endDatetime = ${activity.endDatetime}`
      );
    }
  }

  return (
    (carbonIntensity(activity.withVehicle) * distanceKilometers)
  );
}
