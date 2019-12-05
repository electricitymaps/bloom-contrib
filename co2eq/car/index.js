import {
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_CAR,
  EUROCARSEGMENT_A,
  EUROCARSEGMENT_B,
  EUROCARSEGMENT_C,
  EUROCARSEGMENT_D,
  EUROCARSEGMENT_E,
  EUROCARSEGMENT_F,
  EUROCARSEGMENT_S,
  EUROCARSEGMENT_J,
  EUROCARSEGMENT_M,
  ENGINETYPE_DIESEL,
  ENGINETYPE_PETROL,
  ENGINETYPE_PLUGIN_HYBRID_ELECTRIC,
  ENGINETYPE_BATTERY_ELECTRIC,
  ENGINETYPE_HYBRID,
  ENGINETYPE_LPG,
  ENGINETYPE_CNG
} from '../../definitions';
import cars from './cars.json';

export const modelName = 'car';
export const modelVersion = '1';
export const explanation = {};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { transportationMode, euroCarSegment, engineType, brand } = activity;
  if (transportationMode != TRANSPORTATION_MODE_CAR) {
    return false;
  }
  return true;
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
export function carbonIntensity(euroCarSegment, engineType, brand) {
  const entry = cars.footprints.find(d => d.euroCarSegment === euroCarSegment && d.engineType === engineType && d.brand === brand);
  if (!entry) {
    throw new Error(`Unknown size, type, or brand ${euroCarSegment}_${engineType}_${brand}`);
  }
  return entry.carbonIntensity;
}
