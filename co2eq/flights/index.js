import { geoDistance } from 'd3-geo'; // todo - add d3-geo in package.json
import airports from './airports.json';

// Key constants used in the model
// source: https://www.myclimate.org/fileadmin/user_upload/myclimate_-_home/01_Information/01_About_myclimate/09_Calculation_principles/Documents/myclimate-flight-calculator-documentation_EN.pdf
const shortHaulDistanceThreshold = 1500; // km
const longHaulDistanceThreshold = 2500; // km
const passengerLoadFactor = 0.82; // i.e. 77% of seats occupied on average
const fuelCo2Intensity = 3.150; // kgCO2 per kg jet Fuel
const fuelPreProductionCo2Intensity = 0.54; // kgCO2eq per kg jet fuel
const radiativeForcingMultiplier = 2; // accounts for non-CO2 effect in high altitude (uncertain parameter between 1.5 and 4)
const aircraftFactor = 0.00038; // accounts for using produced, then maintained and at the end of their life disposed.
const detourConstant = 95; //km
const airportinfrastructureFactor = 11.68; // accounts for using the airport infrastructure


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
const passengerToFreightRatio = isShortHaul => (isShortHaul ? 0.93 : 0.74); // km
const averageNumberOfSeats = isShortHaul => (isShortHaul ? 153.51 : 280.21);
const a = isShortHaul => (isShortHaul ? 0 : 0.0001); // empiric fuel consumption parameter
const b = isShortHaul => (isShortHaul ? 2.714 : 7.104); // empiric fuel consumption parameter
const c = isShortHaul => (isShortHaul ? 1166.52 : 5044.93); // empiric fuel consumption parameter

function airportIataCodeToCoordinates(iata) {
  if (!airports[iata]) {
    throw new Error(`Unknown airport code ${iata}`);
  }
  return {
    latitude: airports[iata].lonlat[0],
    longitude: airports[iata].lonlat[1],
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
  // Adapted from https://airasia.listedcompany.com/images/ir-speed-length_7.gif, could be improved!
  if (hour < 3.3) {
    return 14.1 + 495*hour -110*hour*hour +9.85*hour*hour*hour-0.309*hour*hour*hour*hour ;
  }
  else {
    return 770};
    
}

function emissionsForShortOrLongHaul(distance, bookingClass, isShortHaul) {
  return (((a(isShortHaul) * distance * distance) + (b(isShortHaul) * distance) + c(isShortHaul)) / (averageNumberOfSeats(isShortHaul) * passengerLoadFactor)
          
    * 1-passengerToFreightRatio(isShortHaul)
    * bookingClassWeightingFactor(bookingClass, isShortHaul)
    * ((fuelCo2Intensity * radiativeForcingMultiplier) + fuelPreProductionCo2Intensity))
    * aircraftFactor* distance 
    + airportinfrastructureFactor;
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
  if (activity.distanceKilometers && activity.distanceKilometers > 50) {
    // we trust the activity's distance
    return activity.distanceKilometers;
  }
  // If no airport code is available, and no distance is trusteable
  // therefore, compute distance based on duration
  if (!activity.durationHours) {
    throw new Error(`Invalid durationHours ${activity.durationHours}`);
  }
  return distanceFromDuration(activity.durationHours);
}

/*
  Calculates emissions in kgCO2eq
*/
export default function (activity) {
  const distance = activityDistance(activity);

  if (!Number.isFinite(distance)) {
    throw new Error(`Incorrect distance obtained: ${distance}`);
  }
  return emissionsFromDistanceAndClass(distance, activity.bookingClass);
}
