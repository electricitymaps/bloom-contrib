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
export function carbonIntensityGeneric(size, engineType, brand) {
  if (brand != null) {
    return carbonIntensityByBrand(brand);
  }
  if (size === null && engineType === null) {
    return cars['average'].carbonIntensity;
  } else if (size === null) {
    if (!cars[engineType]) {
      throw new Error(`Unknown engine type ${engineType}`);
    }
    return cars[engineType].carbonIntensity;
  } else if (engineType === null) {
    if (!cars[size]) {
      throw new Error(`Unknown size ${size}`);
    }
    return cars[size].carbonIntensity;
  } else {
    const category = `${size}_${engineType}`;
    if (!cars[category]) {
      throw new Error(`Unknown size and type ${size}_${engineType}`);
    }
    return cars[category].carbonIntensity;
  }
}
