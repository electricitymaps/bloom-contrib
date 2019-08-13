import { carbonIntensity as purchaseCarbonIntensity } from './purchase';
import { PURCHASE_CATEGORY_FOOD_RESTAURANT } from '../definitions';
import { convertToEuro } from '../integrations/utils/currency/currency';

export const modelVersion = 1;
export const modelName = 'meal';

export const MEAL_WEIGHT = 400; // grams

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
};
export const INGREDIENTS = Object.keys(CARBON_INTENSITY);

/*
Carbon intensity of ingredient (kgCO2 per kg).
*/
export function carbonIntensity(ingredient) {
  if (!CARBON_INTENSITY[ingredient]) {
    throw Error(`Unknown ingredient: ${ingredient}`);
  }
  return CARBON_INTENSITY[ingredient];
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  const { ingredients } = activity;
  if (ingredients && Object.keys(ingredients).length > 0) {
    return ingredients
      .map(k => carbonIntensity(k) * (MEAL_WEIGHT / 1000.0 / ingredients.length))
      .reduce((a, b) => a + b, 0);
  }

  throw new Error(`Couldn't calculate carbonEmissions for ${activity}`);
}
