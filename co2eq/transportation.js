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

//This function returns an array of models given a make and a year of vehicle.  
//This can be used to ensure that a valid model is selected for the function to get the vehicle id.
export async function getModelsByMake(make, year) {
  const MODELS_URL = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${make}`;

  const res = await fetch(MODELS_URL, {method: 'GET'});

  //check if resok  before continuing.

  const xml = await res.text();
  
  let models;

  parseString(xml, function(error, result){
    if(error){
      console.log(error);
      return;
    }
    models = result.menuItems.menuItem.map(model => model.text[0]);
    return result;
  });

  return models;
}

//Given a valid make model and year return a vehicle id
//This id is used to get the emmissions information.
export async function idFromMakeModelYear(make, year, model) {

  const ID_URL = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${make}&model=${model}`;
  
  const res = await fetch(ID_URL, {method: 'GET'});

  //insert a res !ok error check here. 

  const xml = await res.text();
  
  let id;

  parseString(xml, function(error, result){
    if(error){
      console.log(error);
      return;
    }
    id = result.menuItems.menuItem[0].value[0];
    return result;
  });

  if(id){
    return id
  }
  else {
    throw new Error (`Couldn't find your vehicle, your make = ${make} model= ${model} or year = ${year} may not be in the system, or may be formatted differently than how they were input`)
  }
}

async function getCo2WithId(id, miles) {

  const CO2_URL = `https://www.fueleconomy.gov/ws/rest/vehicle/${id}`

  const co2Res = await fetch(CO2_URL, {method: 'GET'});

  const xml = await co2Res.text();

  let vehicleInfo;
  
  parseString(xml, function(error, result){
    if(error){
      console.log(error);
      return;
    }
    vehicleInfo = result;
    return result;
  });

  const co2 = parseFloat(vehicleInfo.vehicle.co2[0]);
  const co2A = parseFloat(vehicleInfo.vehicle.co2A[0]);
  const co2TailpipeAGpm = parseFloat(vehicleInfo.vehicle.co2TailpipeAGpm[0]);
  const co2TailpipeGpm = parseFloat(vehicleInfo.vehicle.co2TailpipeGpm[0]);

  console.log(co2, co2A, co2TailpipeAGpm, co2TailpipeGpm);

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

