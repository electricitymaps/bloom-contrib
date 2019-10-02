import {
  MEAL_TYPE_VEGAN,
  MEAL_TYPE_VEGETARIAN,
  MEAL_TYPE_FISH,
  MEAL_TYPE_LOW_MEAT,
  MEAL_TYPE_MED_MEAT,
  MEAL_TYPE_HIGH_MEAT,  
} from '../definitions';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'meal';
export const modelVersion = 3;

export const MEAL_WEIGHT = 400; // grams

const MEALS_PER_DAY = 3;
export const INGREDIENT_LIST = { // kgCO2eq / kg
  // meat
  'Lamb': { carbon_intensity: 25.58, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Beef': { carbon_intensity: 26.61, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pork': { carbon_intensity: 5.74, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Turkey': { carbon_intensity: 7.17, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Chicken': { carbon_intensity: 3.65, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Eggs': { carbon_intensity: 3.46, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Duck': { carbon_intensity: 3.09, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Rabbit': { carbon_intensity: 4.7, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Buffalo': { carbon_intensity: 60.43, category: 'Meat' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // seafood
  'Tuna': { carbon_intensity: 2.15, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cod': { carbon_intensity: 3.51, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Flatfish': { carbon_intensity: 6.2, category: 'Seafood' }, // From https://naturerhverv.dk/fileadmin/user_upload/NaturErhverv/Filer/Tvaergaaende/Foedevarernes_klimaaftryk_tabel_1.pdf
  'Herring': { carbon_intensity: 1.16, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Prawns/shrimp': { carbon_intensity: 7.8, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Clams': { carbon_intensity: 0.1, category: 'Seafood' }, // From https://naturerhverv.dk/fileadmin/user_upload/NaturErhverv/Filer/Tvaergaaende/Foedevarernes_klimaaftryk_tabel_1.pdf
  'Lobster': { carbon_intensity: 27.8, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Mussels': { carbon_intensity: 9.51, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pollock': { carbon_intensity: 1.61, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Carp': { carbon_intensity: 1.76, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Mackerel': { carbon_intensity: 1.8, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Sea bass': { carbon_intensity: 3.27, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Haddock': { carbon_intensity: 3.41, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Salmon': { carbon_intensity: 3.47, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Fish (all species)': { carbon_intensity: 3.49, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Whiting': { carbon_intensity: 2.66, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Eel': { carbon_intensity: 3.88, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Common Ling': { carbon_intensity: 6.45, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Trout': { carbon_intensity: 4.2, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pomfret': { carbon_intensity: 6.63, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Rock fish': { carbon_intensity: 6.94, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Octopus/squid/cuttlefish': { carbon_intensity: 7.13, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Brill': { carbon_intensity: 8.41, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Hake': { carbon_intensity: 9.77, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Porbeagle': { carbon_intensity: 11.44, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Anglerfish': { carbon_intensity: 12.29, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Swordfish': { carbon_intensity: 12.84, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Megrim': { carbon_intensity: 14.15, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Turbot': { carbon_intensity: 14.51, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Sole': { carbon_intensity: 20.86, category: 'Seafood' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // dairy
  'Cheese': { carbon_intensity: 8.55, category: 'Dairy' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Milk': { carbon_intensity: 1.29, category: 'Dairy' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cream': { carbon_intensity: 5.64, category: 'Dairy' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Milk Yogurt': { carbon_intensity: 1.31, category: 'Dairy' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Butter': { carbon_intensity: 9.25, category: 'Dairy' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // vegetables
  'Potatoes': { carbon_intensity: 0.18, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Vegetables': { carbon_intensity: 2.0, category: 'Vegetables' }, // http://www.greeneatz.com/foods-carbon-footprint.html
  'Onion': { carbon_intensity: 0.17, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Celery': { carbon_intensity: 0.18, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Carrots': { carbon_intensity: 0.2, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Beetroot': { carbon_intensity: 0.24, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Mushrooms': { carbon_intensity: 0.27, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Rutabage': { carbon_intensity: 0.29, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Fennel': { carbon_intensity: 0.48, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Artichokes': { carbon_intensity: 0.48, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Spinach': { carbon_intensity: 0.54, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Garlic': { carbon_intensity: 0.57, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Aspargus': { carbon_intensity: 0.83, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Ginger': { carbon_intensity: 0.88, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Tomatoes': { carbon_intensity: 0.45, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Olives': { carbon_intensity: 0.63, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Peppers': { carbon_intensity: 0.66, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Zucchini': { carbon_intensity: 0.21, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cucumbers': { carbon_intensity: 0.23, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pumpkins': { carbon_intensity: 0.25, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Avocados': { carbon_intensity: 1.3, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Eggplants': { carbon_intensity: 1.35, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Peas': { carbon_intensity: 0.38, category: 'Vegetables' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // fruits
  'Fruit': { carbon_intensity: 1.1, category: 'Fruits' }, // http://www.greeneatz.com/foods-carbon-footprint.html
  'Melons': { carbon_intensity: 0.25, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Lemons': { carbon_intensity: 0.26, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Limes': { carbon_intensity: 0.26, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Guavas': { carbon_intensity: 0.28, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Apples': { carbon_intensity: 0.29, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pears': { carbon_intensity: 0.31, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Quinces': { carbon_intensity: 0.31, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Dates': { carbon_intensity: 0.32, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Watermelon': { carbon_intensity: 0.32, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Orange': { carbon_intensity: 0.33, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Kiwi': { carbon_intensity: 0.36, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Grapes': { carbon_intensity: 0.37, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cherries': { carbon_intensity: 0.39, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Apricot': { carbon_intensity: 0.43, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Peaches': { carbon_intensity: 0.43, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Nectarines': { carbon_intensity: 0.43, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Figs': { carbon_intensity: 0.43, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Mandarin': { carbon_intensity: 0.45, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pineapples': { carbon_intensity: 0.5, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Grapefruit': { carbon_intensity: 0.51, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pomelo': { carbon_intensity: 0.51, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Tangerines': { carbon_intensity: 0.51, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Strawberries': { carbon_intensity: 0.58, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Bananas': { carbon_intensity: 0.72, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Raspberries': { carbon_intensity: 0.84, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Currants': { carbon_intensity: 0.84, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Gooseberries': { carbon_intensity: 0.84, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cranberries': { carbon_intensity: 0.92, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Blueberries': { carbon_intensity: 0.92, category: 'Fruits' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // grains
  'Rice': { carbon_intensity: 2.55, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pasta': { carbon_intensity: 1.2, category: 'Grains' }, // From https://naturerhverv.dk/fileadmin/user_upload/NaturErhverv/Filer/Tvaergaaende/Foedevarernes_klimaaftryk_tabel_1.pdf
  'Rye bread': { carbon_intensity: 0.93, category: 'Grains' }, // From http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'White bread': { carbon_intensity: 1.054, category: 'Grains' }, // From http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Morning cereals': { carbon_intensity: 0.864, category: 'Grains' }, // From http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Oats': { carbon_intensity: 0.38, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Green beans': { carbon_intensity: 0.31, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Butter beans': { carbon_intensity: 0.39, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Chestnuts': { carbon_intensity: 0.43, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Corn': { carbon_intensity: 0.47, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Soybean': { carbon_intensity: 0.49, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Wheat': { carbon_intensity: 0.52, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Rye': { carbon_intensity: 0.38, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Barley': { carbon_intensity: 0.43, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Chick peas': { carbon_intensity: 0.77, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Sesame seeds': { carbon_intensity: 0.88, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Lentils': { carbon_intensity: 1.03, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Quinoa': { carbon_intensity: 1.15, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Sunflower seed': { carbon_intensity: 1.41, category: 'Grains' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // nuts
  'Nuts': { carbon_intensity: 2.3, category: 'Nuts' }, // http://www.greeneatz.com/foods-carbon-footprint.html
  'Peanuts': { carbon_intensity: 0.83, category: 'Nuts' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Hazelnuts': { carbon_intensity: 0.97, category: 'Nuts' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Cashew nut': { carbon_intensity: 1.44, category: 'Nuts' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Walnuts': { carbon_intensity: 1.51, category: 'Nuts' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Pistachios': { carbon_intensity: 1.53, category: 'Nuts' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Almonds': { carbon_intensity: 1.54, category: 'Nuts' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  // beverages
  'Almond milk': { carbon_intensity: 0.42, category: 'Beverages' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Coconut milk': { carbon_intensity: 0.42, category: 'Beverages' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Soy milk': { carbon_intensity: 0.75, category: 'Beverages' }, // https://www.sciencedirect.com/science/article/pii/S0959652616303584
  'Beer': { carbon_intensity: 1.123, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Wine': { carbon_intensity: 2.344, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Spirits': { carbon_intensity: 3.144, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Juice': { carbon_intensity: 0.93, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Coffee': { carbon_intensity: 0.33, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Tea': { carbon_intensity: 0.184, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Soft drink': { carbon_intensity: 1.035, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Water (bottled)': { carbon_intensity: 0.215, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf
  'Water (tap)': { carbon_intensity: 0.001, category: 'Beverages' }, // http://web.agrsci.dk/djfpublikation/djfpdf/DCArapport158.pdf  
};
export const INGREDIENTS = Object.keys(INGREDIENT_LIST);

const allIngredientCategories = [];
Object.keys(INGREDIENT_LIST).forEach((ingredient) => {
  allIngredientCategories.push(INGREDIENT_LIST[ingredient].category);
});
export const INGREDIENT_CATEGORIES = [...new Set(allIngredientCategories)];

/*
Carbon intensity of ingredient (kgCO2 per kg).
*/
export function carbonIntensityOfIngredient(ingredient) {
  if (!INGREDIENT_LIST[ingredient]) {
    throw Error(`Unknown ingredient: ${ingredient}`);
  }
  return INGREDIENT_LIST[ingredient].carbon_intensity;
}

/*
Carbon intensity of meals (kgCO2 per meal).
*/
function carbonIntensityOfMealType(mealType) {
  // Source: https://link.springer.com/article/10.1007/s10584-014-1169-1
  switch (mealType) {
    case MEAL_TYPE_VEGAN:
      return 2890 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_VEGETARIAN:
      return 3810 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_FISH:
      return 3910 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_LOW_MEAT: 
      // <50g/day
      return 4670 / MEALS_PER_DAY / 1000.0; 
    case MEAL_TYPE_MED_MEAT: 
      // 50–99g/day
      return 5630 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_HIGH_MEAT: 
      // ≥100g/day
      return 7190 / MEALS_PER_DAY / 1000.0;      
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
