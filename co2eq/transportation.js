import {
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_BUS,
  TRANSPORTATION_MODE_TRAIN,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  TRANSPORTATION_MODE_FERRY,
  TRANSPORTATION_MODE_BIKE,
  TRANSPORTATION_MODE_EBIKE,
  TRANSPORTATION_MODE_ESCOOTER,
  TRANSPORTATION_MODE_MOTORBIKE,
} from '../definitions';

import flightEmissions from './flights';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'transportation';
export const modelVersion = '11';
export const explanation = {
  text: 'Calculations take into account direct emissions from burning fuel and manufacturing of vehicle.',
  links: [
    { label: 'Ducky (2019)', href: 'https://static.ducky.eco/calculator_documentation.pdf' },
    { label: 'European Cyclists’ Federation (2011)', href: 'https://ecf.com/files/wp-content/uploads/ECF_BROCHURE_EN_planche.pdf' },
    { label: 'UK GOV DEFRA (2019)', href: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019' },
    { label: 'myclimate (2019)', href: 'https://www.myclimate.org/fileadmin/user_upload/myclimate_-_home/01_Information/01_About_myclimate/09_Calculation_principles/Documents/myclimate-flight-calculator-documentation_EN.pdf' },
    { label: 'IOP Science (2019)', href: 'https://iopscience.iop.org/article/10.1088/1748-9326/ab2da8' },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const {
    transportationMode,
    distanceKilometers,
    durationHours,
    departureAirportCode,
    destinationAirportCode,
  } = activity;
  if (transportationMode && (distanceKilometers || durationHours || (departureAirportCode && destinationAirportCode))) {
    return true;
  }

  return false;
}

/*
Carbon intensity of transportation (kgCO2 per passenger and per km)
*/
function carbonIntensity(mode) {
  switch (mode) {
    case TRANSPORTATION_MODE_BUS:
      return 103 / 1000.0;
      // https://static.ducky.eco/calculator_documentation.pdf, Ecoinvent 3 Regular bus, includes production = 9g
    case TRANSPORTATION_MODE_CAR:
      return 257 / 1000.0;
      // https://static.ducky.eco/calculator_documentation.pdf, Ecoinvent Avg european car, production = 43g    
    case TRANSPORTATION_MODE_MOTORBIKE: 
      // https://static.ducky.eco/calculator_documentation.pdf, Ecoinvent Scooter, production = 14g
      return 108 / 1000.0;        
    case TRANSPORTATION_MODE_TRAIN:
      return 42 / 1000.0;
      // https://static.ducky.eco/calculator_documentation.pdf, Andersen 2007
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
      // Average of train and bus
      return (0.5 * carbonIntensity(TRANSPORTATION_MODE_TRAIN)
        + 0.5 * carbonIntensity(TRANSPORTATION_MODE_BUS));
    case TRANSPORTATION_MODE_FERRY:
      // See https://en.wikipedia.org/wiki/Carbon_footprint
      return 120 / 1000.0;
    case TRANSPORTATION_MODE_BIKE:
      // https://ecf.com/files/wp-content/uploads/ECF_BROCHURE_EN_planche.pdf
      return 5 / 1000.0;
    case TRANSPORTATION_MODE_EBIKE:
      // https://ecf.com/files/wp-content/uploads/ECF_BROCHURE_EN_planche.pdf
      return 17 / 1000.0;  
    case TRANSPORTATION_MODE_ESCOOTER:
      // https://iopscience.iop.org/article/10.1088/1748-9326/ab2da8
      return 125.517 / 1000.0;
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

export function durationToDistance(durationHours, mode) {
  switch (mode) {
    case TRANSPORTATION_MODE_BUS:
      return durationHours * 30.0;
      // assumes mostly city-rides
    case TRANSPORTATION_MODE_CAR:
      return durationHours * 45.0;
      // https://setis.ec.europa.eu/system/files/Driving_and_parking_patterns_of_European_car_drivers-a_mobility_survey.pdf
    case TRANSPORTATION_MODE_MOTORBIKE:
      return durationHours * 45.0;
      // assumes same speed as car
    case TRANSPORTATION_MODE_TRAIN:
      return durationHours * 45.0;
      // assumes mostly suburban trips
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
      // Average of train and bus
      return (0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_TRAIN)
        + 0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_BUS));
    case TRANSPORTATION_MODE_FERRY:
      return durationHours * 30; // ~16 knots
    case TRANSPORTATION_MODE_BIKE:
      return durationHours * 15;
    case TRANSPORTATION_MODE_EBIKE
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

  // Take into account the passenger count if this is a car or motorbike
  if (activity.transportationMode === TRANSPORTATION_MODE_CAR || activity.transportationMode === TRANSPORTATION_MODE_MOTORBIKE) {
    return carbonIntensity(activity.transportationMode) * distanceKilometers / (activity.participants || 1);
  }
  return carbonIntensity(activity.transportationMode) * distanceKilometers;
}
