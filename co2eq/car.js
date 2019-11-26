import {
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_CAR,
} from '../definitions';

export const modelName = 'car';
export const modelVersion = '1';
export const explanation = {};

export const INPUT_DETAILED = 'detailed_input';
export const INPUT_NON_DETAILED = 'non_detailed_input';

// car categories for non-detailed input (without brand name and model)
// categorized by size and type
const GENERIC_CATEGORIES = {
  'small_diesel': {
    size: 'small',
    type: 'diesel',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'small_petrol': {
    size: 'small',
    type: 'petrol',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'small_hybrid': {
    size: 'small',
    type: 'hybrid',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'small_cng': null,
  'small_lpg': null,
  'medium_diesel': {
    size: 'medium',
    type: 'diesel',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'medium_petrol': {
    size: 'medium',
    type: 'petrol',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'medium_hybrid': {
    size: 'medium',
    type: 'hybrid',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'medium_cng': {
    size: 'medium',
    type: 'cng',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'medium_lpg': {
    size: 'medium',
    type: 'lpg',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'large_diesel': {
    size: 'large',
    type: 'diesel',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'large_petrol': {
    size: 'large',
    type: 'petrol',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'large_hybrid': {
    size: 'large',
    type: 'hybrid',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'large_cng': {
    size: 'large',
    type: 'cng',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
  'large_lpg': {
    size: 'large',
    type: 'lpg',
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
    inputLevel: INPUT_NON_DETAILED,
  },
};

// calculates carbon intensity for cars by size and type
export function carbonIntensityNonDetailed(size, type) {
  const category = `${size}_${type}`;
  switch (category) {
    case `small_diesel`:
      return 0.14024;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `small_petrol`:
      return 0.15301;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `small_hybrid`:
      return 0.10409;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `medium_diesel`:
      return 0.16877;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `medium_petrol`:
      return 0.19158;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `medium_hybrid`:
      return 0.10764;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `medium_cng`:
      return 0.15972;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `medium_lpg`:
      return 0.18016;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `large_diesel`:
      return 0.20763;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `large_petrol`:
      return 0.28225;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `large_hybrid`:
      return 0.13022;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `large_cng`:
      return 0.23531;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    case `large_lpg`:
      return 0.26541;
      // Cars (by size) from 'Conversion factors 2019: full set (for advanced users)'
      // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
    default:
      throw new Error (`Unknown car size and type: ${category}`);
  }
}

// Takes into account car's brand name and model
function carbonIntensityDetailed(model) {

}
