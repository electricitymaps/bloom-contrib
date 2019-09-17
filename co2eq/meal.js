import {
  MEAL_TYPE_VEGAN,
  MEAL_TYPE_VEGETARIAN,
  MEAL_TYPE_MEAT_OR_FISH,
} from '../definitions';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'meal';
export const modelVersion = 2;

export const MEAL_WEIGHT = 400; // grams

const MEALS_PER_DAY = 3;
const CARBON_INTENSITY = { // kgCO2eq / kg
// From http://www.greeneatz.com/foods-carbon-footprint.html
  'Lamb': 39.2,
  'Beef': 27.0,
  'Cheese': 13.5,
  'Pork': 12.1,
  'Turkey': 10.9,
  'Chicken': 6.9,
  'Tuna': 6.1,
  'Eggs': 4.8,
  'Potatoes': 2.9,
  'Rice': 2.7,
  'Nuts': 2.3,
  'Beans/tofu': 2.0,
  'Vegetables': 2.0,
  'Milk': 1.9,
  'Fruit': 1.1,
  'Lentils': 0.9,
  // From https://naturerhverv.dk/fileadmin/user_upload/NaturErhverv/Filer/Tvaergaaende/Foedevarernes_klimaaftryk_tabel_1.pdf
  'Pasta': 1.2,
  'Cod': 2.4,
  'Flatfish': 6.2,
  'Herring': 1.3,
  'Shrimp (Fresh)': 3,
  'Shrimp (Frozen)': 10.5,
  'Clams': 0.1,
  'Lobster': 20.2,
  // From http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Beer': 1.123,
  'Wine': 2.344,
  'Spirits': 3.144,
  'Juice': 0.93,
  'Coffee': 0.33,
  'Tea': 0.184,
  'Soft drink': 1.035,
  'Water (bottled)': 0.215,
  'Water (tap)': 0.001,
  'Rye bread': 0.93,
  'White bread': 1.054,
  'Milk Yogurt': 1.372,
  'Morning cereals': 0.864,

};
export const INGREDIENTS = Object.keys(CARBON_INTENSITY);

/*
Carbon intensity of ingredient (kgCO2 per kg).
*/
export function carbonIntensityOfIngredient(ingredient) {
  if (!CARBON_INTENSITY[ingredient]) {
    throw Error(`Unknown ingredient: ${ingredient}`);
  }
  return CARBON_INTENSITY[ingredient];
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
      throw Error(`Unknown meal type: ${mealType}`);
  }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  const { ingredients, mealType } = activity;

  if (ingredients && Object.keys(ingredients).length > 0) {
    return ingredients
      .map(k => carbonIntensityOfIngredient(k) * (MEAL_WEIGHT / 1000.0 / ingredients.length))
      .reduce((a, b) => a + b, 0);
  }

  if (mealType) {
    return carbonIntensityOfMealType(mealType);
  }

  throw new Error('Couldn\'t calculate carbonEmissions for activity because it does not have any ingredients or meal type');
}
