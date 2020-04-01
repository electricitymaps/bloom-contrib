import {
  PURCHASE_CATEGORY_FOOD,
  UNIT_KILOGRAMS,
  MEAL_FROM_INGREDIENTS,
} from '../../definitions';
import {
  getEntryByKey,
  getDescendants,
  getEntryByPath,
  getChecksumOfFootprints,
} from '../purchase';

export const modelName = 'meal-from-ingredients';
export const modelVersion = `1_${getChecksumOfFootprints()}`;
export const explanation = {
  text: 'The calculations take into consideration emissions across the whole lifecycle.',
  links: [
    { label: 'Nature (2017)', href: 'https://www.nature.com/articles/s41598-017-06466-8' },
    { label: 'Tomorrow footprint database', href: 'https://github.com/tmrowco/northapp-contrib/blob/master/co2eq/purchase/footprints.yml' },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const {
    mealType,
    lineItems,
  } = activity;
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

export function carbonEmissions(activity) {
  const {
    mealType,
    lineItems,
  } = activity;

  if (mealType !== MEAL_FROM_INGREDIENTS) {
    throw new Error(`Incorrect mealType. Diet related mealType run throught the meal model.
      Meal from ingredients require {MEAL_FROM_INGREDIENTS} mealType.`)
  }

  if (lineItems && Object.keys(lineItems).length > 0) {
    return lineItems
      .map(k => carbonIntensityOfIngredient(k.identifier) * k.value)
      .reduce((a, b) => a + b, 0);
  }

  throw new Error('Couldn\'t calculate carbonEmissions for activity because it does not have any ingredients.');
}
