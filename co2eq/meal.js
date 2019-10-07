import {
  MEAL_TYPE_VEGAN,
  MEAL_TYPE_VEGETARIAN,
  MEAL_TYPE_MEAT_OR_FISH,
} from '../definitions';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'meal';
export const modelVersion = 3;

export const MEAL_WEIGHT = 400; // grams

const MEALS_PER_DAY = 3;
const CARBON_INTENSITY = { // kgCO2eq / kg
  // meat
  'Lamb': 25.58, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Beef': 26.61, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pork': 5.74, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Turkey': 7.17, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Chicken': 3.65, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Eggs': 3.46, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Duck': 3.09, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Rabbit': 4.7, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Buffalo': 60.43, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // seafood
  'Tuna': 2.15, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cod': 3.51, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Flatfish': 6.2, // From https://naturerhverv.dk/fileadmin/user_upload/NaturErhverv/Filer/Tvaergaaende/Foedevarernes_klimaaftryk_tabel_1.pdf
  'Herring': 1.16, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Prawns/shrimp': 7.8, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Clams': 0.1, // From https://naturerhverv.dk/fileadmin/user_upload/NaturErhverv/Filer/Tvaergaaende/Foedevarernes_klimaaftryk_tabel_1.pdf
  'Lobster': 27.8, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Mussels': 9.51, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pollock': 1.61, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Carp': 1.76, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Mackerel': 1.8, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Sea bass': 3.27, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Haddock': 3.41, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Salmon': 3.47, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Fish (all species)': 3.49, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Whiting': 2.66, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Eel': 3.88, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Common Ling': 6.45, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Trout': 4.2, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pomfret': 6.63, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Rock fish': 6.94, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Octopus/squid/cuttlefish': 7.13, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Brill': 8.41, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Hake': 9.77, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Porbeagle': 11.44, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Anglerfish': 12.29, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Swordfish': 12.84, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Megrim': 14.15, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Turbot': 14.51, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Sole': 20.86, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // dairy
  'Cheese': 8.55, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Milk': 1.29, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cream': 5.64, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Milk Yogurt': 1.31, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Butter': 9.25, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // vegetables
  'Potatoes': 0.18, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Vegetables': 2.0, // http://www.greeneatz.com/foods-carbon-footprint.html
  'Onion': 0.17, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Celery': 0.18, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Carrots': 0.2, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Beetroot': 0.24, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Mushrooms': 0.27, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Rutabage': 0.29, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Fennel': 0.48, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Artichokes': 0.48, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Spinach': 0.54, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Garlic': 0.57, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Aspargus': 0.83, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Ginger': 0.88, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Tomatoes': 0.45, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Olives': 0.63, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Peppers': 0.66, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // fruits
  'Fruit': 1.1, // http://www.greeneatz.com/foods-carbon-footprint.html
  'Zucchini': 0.21, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cucumbers': 0.23, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pumpkins': 0.25, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Melons': 0.25, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Lemons': 0.26, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Limes': 0.26, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Guavas': 0.28, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Apples': 0.29, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pears': 0.31, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Quinces': 0.31, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Dates': 0.32, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Watermelon': 0.32, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Orange': 0.33, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Kiwi': 0.36, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Grapes': 0.37, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cherries': 0.39, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Apricot': 0.43, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Peaches': 0.43, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Nectarines': 0.43, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Figs': 0.43, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Mandarin': 0.45, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pineapples': 0.5, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Grapefruit': 0.51, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pomelo': 0.51, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Tangerines': 0.51, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Strawberries': 0.58, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Bananas': 0.72, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Raspberries': 0.84, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Currants': 0.84, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Gooseberries': 0.84, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cranberries': 0.92, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Blueberries': 0.92, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Avocados': 1.3, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Eggplants': 1.35, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // staples
  'Rice': 2.55, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Nuts': 2.3, // http://www.greeneatz.com/foods-carbon-footprint.html
  'Pasta': 1.2, // From https://naturerhverv.dk/fileadmin/user_upload/NaturErhverv/Filer/Tvaergaaende/Foedevarernes_klimaaftryk_tabel_1.pdf
  'Rye bread': 0.93, // From http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'White bread': 1.054, // From http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Morning cereals': 0.864, // From http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Oats': 0.38, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Green beans': 0.31, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Peas': 0.38, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Butter beans': 0.39, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Chestnuts': 0.43, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Corn': 0.47, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Soybean': 0.49, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Wheat': 0.52, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Rye': 0.38, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Barley': 0.43, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Chick peas': 0.77, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Peanuts': 0.83, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Sesame seeds': 0.88, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Hazelnuts': 0.97, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Lentils': 1.03, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Quinoa': 1.15, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Sunflower seed': 1.41, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cashew nut': 1.44, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Walnuts': 1.51, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pistachios': 1.53, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Almonds': 1.54, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // beverages
  'Almond milk': 0.42, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Coconut milk': 0.42, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Soy milk': 0.75, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Beer': 1.123, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Wine': 2.344, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Spirits': 3.144, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Juice': 0.93, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Coffee': 0.33, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Tea': 0.184, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Soft drink': 1.035, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Water (bottled)': 0.215, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Water (tap)': 0.001, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf  
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
