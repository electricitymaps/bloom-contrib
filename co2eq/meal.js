import {
  MEAL_TYPE_VEGAN,
  MEAL_TYPE_VEGETARIAN,
  MEAL_TYPE_MEAT_OR_FISH,
} from '../definitions';
import { getEntryByKey, getDescendants, getEntryByPath } from './purchase';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'meal';
export const modelVersion = 3;

export const MEAL_WEIGHT = 400; // grams

const MEALS_PER_DAY = 3;

const foodBranch = getEntryByPath(['Food']); // **** TODO: use a constant for the Food category??
const ingredients = getDescendants(foodBranch);
export const INGREDIENT_KEYS = Object.keys(ingredients);
export const INGREDIENT_CATEGORIES = [
  ...new Set(Object.keys(foodBranch['_children'])),
];
export const ingredientCategory = {};
export const ingredientIcon = {};
Object.entries(ingredients).forEach(([k, v]) => {
  ingredientCategory[k] = v.parentKey;
  ingredientIcon[k] = v.icon;
});

/*
Carbon intensity of ingredient (kgCO2 per kg).
*/
export function carbonIntensityOfIngredient(ingredient) {
  const entry = getEntryByKey(ingredient);
  if (!entry) {
    throw new Error(`Unknown ingredient: ${ingredient}`);
  }
  if (!entry.intensity) {
    throw new Error(`Missing carbon intensity for ingredient: ${ingredient}`);
  }
  return entry.intensity;
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
      .map(k => carbonIntensityOfIngredient(k) * (MEAL_WEIGHT / 1000.0 / mealIngredients.length))
      .reduce((a, b) => a + b, 0);
  }

  if (mealType) {
    return carbonIntensityOfMealType(mealType);
  }

  throw new Error('Couldn\'t calculate carbonEmissions for activity because it does not have any ingredients or meal type');
}
