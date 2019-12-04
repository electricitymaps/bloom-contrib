import {
  MEAL_TYPE_VEGAN,
  MEAL_TYPE_VEGETARIAN,
  MEAL_TYPE_MEAT_OR_FISH,
  PURCHASE_CATEGORY_FOOD,
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
    { label: 'Environmental impact of omnivorous, ovo-lacto-vegetarian, and vegan diet', href: 'https://www.nature.com/articles/s41598-017-06466-8' },
    { label: 'Tomorrow footprint database', href: 'https://github.com/tmrowco/tmrowapp-contrib/blob/master/co2eq/purchase/footprints.yml' },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { mealType, ingredients } = activity;
  if (mealType || (ingredients && Object.keys(ingredients).length > 0)) {
    return true;
  }

  return false;
}

const foodBranch = getEntryByPath([PURCHASE_CATEGORY_FOOD]);
const ingredients = getDescendants(foodBranch);
export const INGREDIENT_KEYS = Object.keys(ingredients);
export const INGREDIENT_CATEGORIES = [
  ...new Set(Object.keys(foodBranch['_children'])),
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
  ingredientConversions[k] = v.conversions || { grams: { kilograms: 0.001, incrementStepSize: 50 } };
  ingredientConversionUnit[k] = v.conversions ? Object.keys(v.conversions)[0] : 'gram';
  ingredientConversionKilograms[k] = v.conversions ? v.conversions[Object.keys(v.conversions)[0]].kilograms : 0.001;
  ingredientConversionStepsize[k] = v.conversions ? v.conversions[Object.keys(v.conversions)[0]].incrementStepSize : 50;
});

/*
Carbon intensity of ingredient (kgCO2 per kg).
*/
export function carbonIntensityOfIngredient(ingredient) {
  const entry = getEntryByKey(ingredient);
  if (!entry) {
    throw new Error(`Unknown ingredient: ${ingredient}`);
  }
  if (!entry.intensityKilograms) {
    throw new Error(`Missing carbon intensity for ingredient: ${ingredient}`);
  }
  if (entry.unit !== 'kg') {
    throw new Error(`Unexpected footprint unit ${entry.unit}. Expected 'kg'`);
  }
  return entry.intensityKilograms;
}

/*
Carbon intensity of meals (kgCO2 per meal).
*/
function carbonIntensityOfMealType(mealType) {
  // Source: https://www.nature.com/articles/s41598-017-06466-8
  switch (mealType) {
    case MEAL_TYPE_VEGAN:
      return 2336.1 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_VEGETARIAN:
      return 2598.3 / MEALS_PER_DAY / 1000.0;
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
  const { mealType } = activity;
  const mealIngredients = activity.ingredients;

  if (mealIngredients && Object.keys(mealIngredients).length > 0) {
    return mealIngredients
      .map(k => carbonIntensityOfIngredient(k.name) * k.kilograms)
      .reduce((a, b) => a + b, 0);
  }

  if (mealType) {
    return carbonIntensityOfMealType(mealType);
  }

  throw new Error('Couldn\'t calculate carbonEmissions for activity because it does not have any ingredients or meal type');
}
