import {
  MEAL_TYPE_VEGAN,
  MEAL_TYPE_VEGETARIAN,
  MEAL_TYPE_PESCETARIAN,
  MEAL_TYPE_MEAT_LOW,
  MEAL_TYPE_MEAT_MEDIUM,
  MEAL_TYPE_MEAT_HIGH,
  MEAL_TYPE_MEAT_OR_FISH,
  PURCHASE_CATEGORY_FOOD,
  UNIT_KILOGRAMS,
} from '../definitions';
import {
  getEntryByKey,
  getDescendants,
  getEntryByPath,
  getChecksumOfFootprints,
} from './purchase';

const MEALS_PER_DAY = 3;

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'meal';
export const modelVersion = `5_${getChecksumOfFootprints()}`; // This model relies on footprints.yaml
export const explanation = {
  // TODO(olc): Write a description for mealType as well.
  text: 'The calculations take into consideration emissions across the whole lifecycle.',
  links: [
    { label: 'Nature (2017)', href: 'https://www.nature.com/articles/s41598-017-06466-8' },
    { label: 'Tomorrow footprint database', href: 'https://github.com/tmrowco/northapp-contrib/blob/master/co2eq/purchase/footprints.yml' },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { mealType, lineItems } = activity;
  if (mealType || (lineItems && lineItems.length)) {
    return true;
  }

  return false;
}

const foodBranch = getEntryByPath([PURCHASE_CATEGORY_FOOD]);
const ingredients = getDescendants(foodBranch);
export const INGREDIENT_KEYS = Object.keys(ingredients);
export const INGREDIENT_CATEGORIES = [
  ...new Set(Object.keys(foodBranch._children)),
];
export const ingredientCategory = {};
export const ingredientIcon = {};

export const ingredientConversions = {}; // All conversions
export const ingredientConversionUnit = {}; // Only the first conversion
export const ingredientConversionKilograms = {}; // Only the first conversion
export const ingredientConversionStepsize = {}; // Only the first conversion
Object.entries(ingredients).forEach(([k, v]) => {
  ingredientCategory[k] = v.parentKey;
  ingredientIcon[k] = v.icon;
  ingredientConversions[k] = v.conversions || { [UNIT_KILOGRAMS]: { kilograms: 0.001, incrementStepSize: 0.05 } };
  ingredientConversionUnit[k] = v.conversions ? Object.keys(v.conversions)[0] : UNIT_KILOGRAMS;
  ingredientConversionKilograms[k] = v.conversions ? v.conversions[Object.keys(v.conversions)[0]].kilograms : 1;
  ingredientConversionStepsize[k] = v.conversions ? v.conversions[Object.keys(v.conversions)[0]].incrementStepSize : 0.05;
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
  } else if (unit === UNIT_GRAMS) {
    conversionKilograms = 0.001;
  } else {
    // Note: Use the helper map ingredientConversion as it contains defaults for entries without conversions!
    const conversion = ingredientConversions[identifier] && ingredientConversions[identifier][unit]
    if (!conversion || !conversion.kilograms) {
      throw new Error("Invalid or no conversion to kilograms")
    }
      conversionKilograms = conversion.kilograms;
  }
  return entry.intensityKilograms * conversionKilograms * value;
}

/*
Carbon intensity of meals (kgCO2 per meal).
// Source: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4372775/
The values are age-and-sex-adjusted means per 2000 kcal.
*/
function carbonIntensityOfMealType(mealType) {
  switch (mealType) {
    case MEAL_TYPE_VEGAN:
      return 2890.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_VEGETARIAN:
      return 3810.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_PESCETARIAN:
      return 3910.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_MEAT_LOW:
      return 4770.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_MEAT_MEDIUM:
      return 5630.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_MEAT_HIGH:
      return 7190.0 / MEALS_PER_DAY / 1000.0;
    // Source: https://www.nature.com/articles/s41598-017-06466-8
    // should be removed as inconsistent with previous source.
    case MEAL_TYPE_MEAT_OR_FISH:
      return 3959.3 / MEALS_PER_DAY / 1000.0;
    default:
      throw new Error(`Unknown meal type: ${mealType}`);
  }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  const { mealType, lineItems } = activity;

  if (lineItems && Object.keys(lineItems).length > 0) {
    return lineItems.reduce((a, b) => a + carbonIntensityOfIngredient(b), 0)
  }

  if (mealType) {
    return carbonIntensityOfMealType(mealType);
  }

  throw new Error('Couldn\'t calculate carbonEmissions for activity because it does not have any ingredients or meal type');
}
