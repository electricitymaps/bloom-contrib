import {
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_BUS,
  TRANSPORTATION_MODE_TRAIN,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  TRANSPORTATION_MODE_FERRY,
  TRANSPORTATION_MODE_BIKE,
  TRANSPORTATION_MODE_ESCOOTER,
} from '../definitions';

import flightEmissions from './flights';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'transportation';
export const modelVersion = 8;

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
    case TRANSPORTATION_MODE_FERRY:
      // See https://en.wikipedia.org/wiki/Carbon_footprint
      return 0.12;
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
    case TRANSPORTATION_MODE_FERRY:
      return durationHours * 30; // ~16 knots
    case TRANSPORTATION_MODE_BIKE:
      return durationHours * 10;
    case TRANSPORTATION_MODE_ESCOOTER:
      return durationHours * 10;  
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

export function getModelsByMake(make, year) {
  const MODELS_URL = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${make}`;

  const res = await fetch(MODELS_URL, {method: 'GET'});

  
  //check if resok  before continuing.
  const models = res.getElementsByTagName("model"); //check how to get multiple peices of data from a XML or CSV

}

//make model and year must be input correctly how they are in the 
export function idFromMakeModelYear(make, year, model) {

  const ID_URL = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`;
  
  const res = await fetch(ID_URL, {method: 'GET'});

  //insert a res !ok error check here. 
  //This may be res.body or something like that.  Need to verify these fields
  const id = res.getElementsByTagName("value")[0].childNodes[0].nodeValue;
  if(id){
    return id
  }
  else {
    throw new Error (`Couldn't find your vehicle, your make = ${make} model= ${model} or year = ${year} may not be in the system, or may be formatted differently than how they were input`)
  }
}

export function getCo2WithId(id, miles) {

  const CO2_URL = `https://www.fueleconomy.gov/ws/rest/vehicle/${id}`

  const co2Res = await fetch(CO2_URL, {method: 'GET'});

  //Check if res is ok before continuing

  const co2 = co2Res.getElementsByTagName("co2")[0].childNodes[0].nodeValue;
  const co2A = co2Res.getElementsByTagName("co2A")[0].childNodes[0].nodeValue;
  const co2TailpipeAGpm = co2Res.getElementsByTagName("co2TailpipeAGpm")[0].childNodes[0].nodeValue;
  const co2TailpipeGpm = co2Res.getElementsByTagName("co2TailpipeGpm")[0].childNodes[0].nodeValue;

  if (co2TailpipeGpm > 0) {
    return co2TailpipeGpm * miles / 1000;
  }
  else if (co2 > 0) {
    return co2 * miles / 1000; 
  }
  else if (co2TailpipeAGpm > 0) {
    return co2TailpipeAGpm * miles / 1000;
  }
  else if (co2A > 0) {
    return co2A * miles / 1000; 
  }
  else {
    throw new Error(`Couldn't find information on your vehicle by id, your id = ${id}`);
}
}
