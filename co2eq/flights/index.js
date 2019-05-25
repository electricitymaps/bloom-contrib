import { geoDistance } from 'd3-geo'; // todo - add d3-geo in package.json
import airports from './airports.json';

// Key constants used in the model
// source: http://www.myclimate.org/fileadmin/myc/files_myc_perf/12_flight_calculator_documentation_EN.pdf
const shortHaulDistanceThreshold = 1500; // km
const longHaulDistanceThreshold = 2500; // km
const passengerLoadFactor = 0.77; // i.e. 77% of seats occupied on average
const passengerToFreightRatio = 0.951;
const fuelCo2Intensity = 3.150; // kgCO2 per kg jet Fuel
const fuelPreProductionCo2Intensity = 0.51; // kgCO2eq per kg jet fuel
const radiativeForcingMultiplier = 2; // accounts for non-CO2 effect in high altitude (uncertain parameter between 1.5 and 4)

const bookingClassWeightingFactor = (bookingClass, isShortHaul) => {
  // TODO(bl): use constants in sources to improve matching probability
  switch (bookingClass) {
    case 'business':
      return isShortHaul ? 1.26 : 1.54;
    case 'first':
      return 2.40;
    default:
      return isShortHaul ? 0.960 : 0.800; // assumed economy class by default
  }
};

// long/short-haul dependent constants
const detourConstant = isShortHaul => (isShortHaul ? 50 : 125); // km
const averageNumberOfSeats = isShortHaul => (isShortHaul ? 158.440 : 280.39);
const a = isShortHaul => (isShortHaul ? 3.87871E-05 : 0.000134576); // empiric fuel consumption parameter
const b = isShortHaul => (isShortHaul ? 2.9866 : 6.1798); // empiric fuel consumption parameter
const c = isShortHaul => (isShortHaul ? 1263.42 : 3446.20); // empiric fuel consumption parameter

function airportIataCodeToCoordinates(iata) {
  return {
    latitude: airports[iata].lat,
    longitude: airports[iata].lon,
  };
}

function distanceFromAirports(airportCode1, airportCode2, isShortHaul) {
  return (
    geoDistance(
      [
        airportIataCodeToCoordinates(airportCode1).longitude,
        airportIataCodeToCoordinates(airportCode1).latitude,
      ],
      [
        airportIataCodeToCoordinates(airportCode2).longitude,
        airportIataCodeToCoordinates(airportCode2).latitude,
      ]
    ) * 6371 // To convert great-arc distance (in radians) into km.
      + detourConstant(isShortHaul)
  );
}

function distanceFromDuration(hour) {
  // TODO(bl): improve the speed assumption
  return hour * 800;
}

function emissionsForShortOrLongHaul(distance, bookingClass, isShortHaul) {
  return (((a(isShortHaul) * distance * distance) + (b(isShortHaul) * distance) + c(isShortHaul)) / (averageNumberOfSeats(isShortHaul) * passengerLoadFactor)
    * passengerToFreightRatio
    * bookingClassWeightingFactor(bookingClass, isShortHaul)
    * ((fuelCo2Intensity * radiativeForcingMultiplier) + fuelPreProductionCo2Intensity));
}

function emissionsBetweenShortAndLongHaul(distance, bookingClass) {
  // Formula for inbetween short and long haul is a linear interpolation between
  // both hauls
  const eMin = emissionsForShortOrLongHaul(shortHaulDistanceThreshold, bookingClass, true);
  const eMax = emissionsForShortOrLongHaul(longHaulDistanceThreshold, bookingClass, false);
  // x is between 0 (short haul) and 1 (long haul)
  const x = (distance - shortHaulDistanceThreshold) / (longHaulDistanceThreshold - shortHaulDistanceThreshold);
  return ((1 - x) * eMin) + (x * eMax);
}

function emissionsFromDistanceAndClass(distance, bookingClass) {
  if (distance < shortHaulDistanceThreshold || distance > longHaulDistanceThreshold) {
    // Flight is eigher short or long (but not in between)
    const isShortHaul = distance < shortHaulDistanceThreshold;
    return emissionsForShortOrLongHaul(distance, bookingClass, isShortHaul);
  }
  return emissionsBetweenShortAndLongHaul(distance, bookingClass);
}

export function activityDistance(activity) {
  if (activity.departureAirportCode && activity.destinationAirportCode) {
    // compute distance from airport codes
    return distanceFromAirports(activity.departureAirportCode, activity.destinationAirportCode);
  }
  if (activity.distance && activity.distance > 50) {
    // we trust the activity's distance
    return activity.distance;
  }
  // If no airport code is available, and no distance is trusteable
  // therefore, compute distance based on duration
  return distanceFromDuration(activity.durationHours);
}

/*
  Calculates emissions in kgCO2eq
*/
export default function (activity) {
  const distance = activityDistance(activity);

  if (!Number.isFinite(distance)) {
    throw Error(`Incorrect distance obtained: ${distance}`);
  }
  return emissionsFromDistanceAndClass(distance, activity.bookingClass);
}
