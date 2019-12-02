import {
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_CAR,
} from '../../definitions';
import cars from './cars.json';

export const modelName = 'car';
export const modelVersion = '1';
export const explanation = {};


// look up carbonIntensity by brand name
export function carbonIntensityByBrand(brand) {
  if (!cars[brand]) {
    throw new Error(`Unknown brand name ${brand}`);
  } else {
    return cars[brand].carbonIntensity;
  }
}

// look up carbon intensity for cars by size and type
export function carbonIntensity(size, engineType, brand) {
  const entry = cars.footprints.find(d => d.size === size && d.engineType === engineType && d.brand === brand)
  if (!entry) {
    throw new Error(`Unknown size and type ${size}_${engineType}`);
  }
  return entry.carbonIntensity;
}

