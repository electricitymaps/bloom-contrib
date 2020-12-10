import { ACTIVITY_TYPE_MEAL, PURCHASE_CATEGORY_FOOD, UNIT_KILOGRAMS } from '../../definitions';
import {
  getChecksumOfFootprints,
  getDescendants,
  getEntryByKey,
  getEntryByPath,
} from '../purchase';

export const modelName = 'meal-from-ingredients';
export const modelVersion = `1_${getChecksumOfFootprints()}`;
export const explanation = {
  text:
    'The calculations take into consideration emissions of greenhouse gases across the whole lifecycle of the ingredients.',
  links: [
    {
      label: 'Tomorrow footprint database',
      href: 'https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/footprints.yml',
    },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { activityType, lineItems } = activity;
  if (activityType === ACTIVITY_TYPE_MEAL && lineItems && lineItems.length) {
    const { identifier } = lineItems[0];
    const entry = getEntryByKey(identifier);
    if (!entry) {
      return false;
    }
    if (!entry.intensityKilograms) {
      return false;
    }
    if (entry.unit !== UNIT_KILOGRAMS) {
      return false;
    }
    return true;
  }
  return false;
}

const foodBranch = getEntryByPath([PURCHASE_CATEGORY_FOOD]);
const ingredients = getDescendants(foodBranch);
export const INGREDIENT_KEYS = Object.keys(ingredients);
export const INGREDIENT_CATEGORIES = [...new Set(Object.keys(foodBranch._children))];
export const ingredientCategory = {};
export const ingredientIcon = {};

export const ingredientConversions = {}; // All conversions
export const ingredientConversionUnit = {}; // Only the first conversion
export const ingredientConversionKilograms = {}; // Only the first conversion
export const ingredientConversionStepsize = {}; // Only the first conversion
Object.entries(ingredients).forEach(([k, v]) => {
  ingredientCategory[k] = v.parentKey;
  ingredientIcon[k] = v.icon;
  ingredientConversions[k] = v.conversions || {
    [UNIT_KILOGRAMS]: { kilograms: 0.001, incrementStepSize: 0.05 },
  };
  ingredientConversionUnit[k] = v.conversions ? Object.keys(v.conversions)[0] : UNIT_KILOGRAMS;
  ingredientConversionKilograms[k] = v.conversions
    ? v.conversions[Object.keys(v.conversions)[0]].kilograms
    : 1;
  ingredientConversionStepsize[k] = v.conversions
    ? v.conversions[Object.keys(v.conversions)[0]].incrementStepSize
    : 0.05;
});

/**
 * Returns the carbon intensity of an ingredient (kgCO2 per kg).
 * @param {lineItem} lineItem - Object with properties identifier, value and a unit
 */
export function carbonIntensityOfIngredient({ identifier, value, unit }) {
  const entry = getEntryByKey(identifier);
  if (!entry) {
    throw new Error(`Unknown ingredient: ${identifier}`);
  }
  if (!entry.intensityKilograms) {
    throw new Error(`Missing carbon intensity for ingredient: ${identifier}`);
  }
  if (entry.unit !== UNIT_KILOGRAMS) {
    throw new Error(`Unexpected footprint unit ${entry.unit}. Expected 'kg'`);
  }

  // Calculate emissions (always relative to kg) by getting possible conversions
  let conversionKilograms;
  if (unit === UNIT_KILOGRAMS) {
    conversionKilograms = 1;
  } else {
    // Note: Use the helper map ingredientConversion as it contains defaults for entries without conversions!
    const conversion = ingredientConversions[identifier] && ingredientConversions[identifier][unit];
    if (!conversion || !conversion.kilograms) {
      throw new Error('Invalid or no conversion to kilograms');
    }
    conversionKilograms = conversion.kilograms;
  }
  return entry.intensityKilograms * conversionKilograms * value;
}

export function carbonEmissions(activity) {
  const { lineItems } = activity;

  if (lineItems && Object.keys(lineItems).length > 0) {
    return lineItems.reduce((a, b) => a + carbonIntensityOfIngredient(b), 0);
  }

  throw new Error(
    "Couldn't calculate carbonEmissions for activity because it does not have any ingredients."
  );
}
