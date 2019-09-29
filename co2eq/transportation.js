import {
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_ICE_CAR,
  TRANSPORTATION_MODE_HYBRID_CAR,
  TRANSPORTATION_MODE_ELECTRIC_CAR,
  TRANSPORTATION_MODE_MOTORBIKE,  
  TRANSPORTATION_MODE_BUS,
  TRANSPORTATION_MODE_TRAIN,
  TRANSPORTATION_MODE_HIGH_SPEED_TRAIN,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  TRANSPORTATION_MODE_FERRY,
  TRANSPORTATION_MODE_BIKE,
  TRANSPORTATION_MODE_ESCOOTER,
} from '../definitions';

import flightEmissions from './flights';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'transportation';
export const modelVersion = 9;

/*
Carbon intensity of transportation (kgCO2 per passenger and per km)
*/
function carbonIntensity(mode) {
  switch (mode) {
    case TRANSPORTATION_MODE_BUS: // https://static.ducky.eco/calculator_documentation.pdf, Ecoinvent 3 Regular bus, production = 9g
      return 103 / 1000.0;
    case TRANSPORTATION_MODE_ICE_CAR: // https://static.ducky.eco/calculator_documentation.pdf, Ecoinvent Avg european car, production = 43g
      return 257 / 1000.0;
    case TRANSPORTATION_MODE_HYBRID_CAR: // https://static.ducky.eco/calculator_documentation.pdf, Samaras 2008, Low Carbon Scenario
      return 180 / 1000.0;  
    case TRANSPORTATION_MODE_ELECTRIC_CAR: // https://static.ducky.eco/calculator_documentation.pdf, Ecoinvent 3, Electric vehicle with nordic electricity mix 
      return 81 / 1000.0;  
    case TRANSPORTATION_MODE_TRAIN: // https://static.ducky.eco/calculator_documentation.pdf, Andersen 2007
      return 42 / 1000.0;
    case TRANSPORTATION_MODE_HIGH_SPEED_TRAIN: // https://www.iea.org/newsroom/news/2017/december/high-speed-rail-presents-major-opportunities-for-decarbonisation-of-transport.html, EU average
      return 24 / 1000.0;  
    case TRANSPORTATION_MODE_MOTORBIKE: // https://static.ducky.eco/calculator_documentation.pdf, Ecoinvent Scooter, production = 14g
      return 108 / 1000.0;  
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
      // Average of train and bus
      return (0.5 * carbonIntensity(TRANSPORTATION_MODE_TRAIN)
        + 0.5 * carbonIntensity(TRANSPORTATION_MODE_BUS));
    case TRANSPORTATION_MODE_FERRY: 
      // See https://en.wikipedia.org/wiki/Carbon_footprint
      return 120 / 1000.0 ;
    case TRANSPORTATION_MODE_BIKE:
      // https://ecf.com/files/wp-content/uploads/ECF_BROCHURE_EN_planche.pdf
      return 5 / 1000.0;
    case TRANSPORTATION_MODE_ESCOOTER:
      // https://iopscience.iop.org/article/10.1088/1748-9326/ab2da8
      return 202 / 1000.0;  
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

export function durationToDistance(durationHours, mode) {
  switch (mode) {
    case TRANSPORTATION_MODE_BUS: // assumes mostly city-rides
      return durationHours * 30.0;
    case TRANSPORTATION_MODE_CAR: // https://setis.ec.europa.eu/system/files/Driving_and_parking_patterns_of_European_car_drivers-a_mobility_survey.pdf
      return durationHours * 45.0;
    case TRANSPORTATION_MODE_TRAIN: // assumes mostly suburban trips
      return durationHours * 45.0;
    case TRANSPORTATION_MODE_HIGH_SPEED_TRAIN: 
      return durationHours * 200.0;  
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
      // Average of train and bus
      return (0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_TRAIN)
        + 0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_BUS));
    case TRANSPORTATION_MODE_FERRY:
      return durationHours * 30; // ~16 knots
    case TRANSPORTATION_MODE_BIKE:
      return durationHours * 15;
    case TRANSPORTATION_MODE_ESCOOTER:
      return durationHours * 15;  
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  // Plane-specific model
  if (activity.transportationMode === TRANSPORTATION_MODE_PLANE) {
    return flightEmissions(activity);
  }

  let distanceKilometers = activity.distanceKilometers;
  if (!distanceKilometers) {
    // fallback on duration if available
    if ((activity.durationHours || 0) > 0) {
      distanceKilometers = durationToDistance(activity.durationHours, activity.transportationMode);
    } else {
      throw new Error(`Couldn't calculate carbonEmissions for activity because distanceKilometers = ${distanceKilometers} and durationHours = ${activity.durationHours}`);
    }
  }

  // Take into account the passenger count if this is a car
  if (activity.transportationMode === TRANSPORTATION_MODE_CAR) {
    return carbonIntensity(activity.transportationMode) * distanceKilometers / (activity.participants || 1);
  }
  return carbonIntensity(activity.transportationMode) * distanceKilometers;
}
