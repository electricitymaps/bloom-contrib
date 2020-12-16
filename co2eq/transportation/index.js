import {
  TRANSPORTATION_MODE_BIKE,
  TRANSPORTATION_MODE_BUS,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_EBIKE,
  TRANSPORTATION_MODE_ESCOOTER,
  TRANSPORTATION_MODE_FERRY,
  TRANSPORTATION_MODE_FOOT,
  TRANSPORTATION_MODE_MOTORBIKE,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  TRANSPORTATION_MODE_TRAIN,
} from '../../definitions';
import { getActivityDurationHours } from '../utils';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'transportation';

export const modelVersion = '15';

export const explanation = {
  text:
    'Calculations take into account direct emissions from burning fuel and manufacturing of vehicle, incl shoes for walking.',
  links: [
    { label: 'Ducky (2019)', href: 'https://static.ducky.eco/calculator_documentation.pdf' },
    {
      label: 'European Cyclists’ Federation (2011)',
      href: 'https://ecf.com/files/wp-content/uploads/ECF_BROCHURE_EN_planche.pdf',
    },
    {
      label: 'UK GOV DEFRA (2019)',
      href:
        'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019',
    },
    {
      label: 'IOP Science (2019)',
      href: 'https://iopscience.iop.org/article/10.1088/1748-9326/ab2da8',
    },
    {
      label: 'ADEME (2018)',
      href:
        'https://www.ademe.fr/sites/default/files/assets/documents/poids_carbone-biens-equipement-201809-rapport.pdf',
    },
  ],
};

export const modelCanRunVersion = 3;
export function modelCanRun(activity) {
  const { transportationMode } = activity;
  if (transportationMode) {
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
      return 0.1771;
    // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019, average of diesel and petrol
    case TRANSPORTATION_MODE_MOTORBIKE:
      // https://static.ducky.eco/calculator_documentation.pdf, Ecoinvent Scooter, production = 14g
      return 108 / 1000.0;
    case TRANSPORTATION_MODE_TRAIN:
      return 42 / 1000.0;
    // https://static.ducky.eco/calculator_documentation.pdf, Andersen 2007
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
      // Average of train and bus
      return (
        0.5 * carbonIntensity(TRANSPORTATION_MODE_TRAIN) +
        0.5 * carbonIntensity(TRANSPORTATION_MODE_BUS)
      );
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
    case TRANSPORTATION_MODE_FOOT:
      // https://www.ademe.fr/sites/default/files/assets/documents/poids_carbone-biens-equipement-201809-rapport.pdf
      // Using the average footprint of shoes (18kg CO2eq/pair) and using a life expectancy of a shoe of 500km
      return 36 / 1000.0;
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
      return (
        0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_TRAIN) +
        0.5 * durationToDistance(durationHours, TRANSPORTATION_MODE_BUS)
      );
    case TRANSPORTATION_MODE_FERRY:
      return durationHours * 30; // ~16 knots
    case TRANSPORTATION_MODE_BIKE:
      return durationHours * 15;
    case TRANSPORTATION_MODE_EBIKE:
      return durationHours * 15;
    case TRANSPORTATION_MODE_ESCOOTER:
      return durationHours * 15;
    case TRANSPORTATION_MODE_FOOT:
      return durationHours * 5;
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

/*
 * Fallback to a reasonable duration if we're missing data to calculate duration
 * @param {string} mode string
 * @returns {number} Fallback duration in hours.
 */
function getDurationFallback(mode) {
  switch (mode) {
    // http://ced.berkeley.edu/downloads/dcrp/docs/dai-weinzimmer-shuttles.pdf
    case TRANSPORTATION_MODE_FOOT:
      return 0.25;
    // https://mapazdashboard.arizona.edu/infrastructure/commute-time
    // based off average commute times (23 minutes)
    case TRANSPORTATION_MODE_BUS:
    case TRANSPORTATION_MODE_CAR:
    case TRANSPORTATION_MODE_MOTORBIKE:
    case TRANSPORTATION_MODE_ESCOOTER:
    case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
    case TRANSPORTATION_MODE_TRAIN:
      return 0.38;
    // https://sanfranciscobayferry.com/route/ballpark/oakland
    case TRANSPORTATION_MODE_FERRY:
      return 0.5;
    // https://www.caee.utexas.edu/prof/Bhat/ABSTRACTS/sener_eluru_bhat_bicycle_rev_Jan18_TRBstyle.pdf (page 6)
    case TRANSPORTATION_MODE_BIKE:
    case TRANSPORTATION_MODE_EBIKE:
      // 10.5 km average distance / average speed 23.5 km/h
      return 0.45;
    default:
      throw Error(`Unknown transportation mode: ${mode}`);
  }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  const { transportationMode, datetime, endDatetime, isRoundtrip, participants } = activity;
  let { distanceKilometers } = activity;
  if (!distanceKilometers) {
    const activityDuration = getActivityDurationHours(activity);
    let durationHours = 0;
    if (activityDuration !== null) {
      durationHours = activityDuration;
    } else {
      durationHours = getDurationFallback(transportationMode);
    }
    if (durationHours > 0) {
      distanceKilometers = durationToDistance(durationHours, transportationMode);
    } else {
      throw new Error(
        `Couldn't calculate carbonEmissions for activity because distanceKilometers = ${distanceKilometers} and datetime = ${datetime} and endDatetime = ${endDatetime}`
      );
    }
  }

  const baseFootprint = carbonIntensity(activity.transportationMode) * distanceKilometers;

  // Take into account the passenger count if this is a car or motorbike
  const shouldAcceptParticipants =
    transportationMode === TRANSPORTATION_MODE_CAR ||
    transportationMode === TRANSPORTATION_MODE_MOTORBIKE;

  let updatedFootprint = baseFootprint;

  if (isRoundtrip) {
    updatedFootprint = updatedFootprint * 2;
  }

  if (shouldAcceptParticipants && participants) {
    updatedFootprint = updatedFootprint / participants;
  }

  return updatedFootprint;
}
