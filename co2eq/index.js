import * as carCarbonModel from './car/index';
import * as electricityWorldAverageCarbonModel from './electricity/worldaverage';
import * as energyCarbonModel from './energy/index';
import * as flightCarbonModel from './flights/index';
import * as ingredientsCarbonModel from './food/ingredients';
import * as mealCarbonModel from './food/meal';
import * as hotelCarbonModel from './hotelpercountry/index';
import * as purchaseCarbonModel from './purchase/index';
import * as transportationCarbonModel from './transportation/index';

// Note: fallback models must be at the end
const carbonModels = [
  ingredientsCarbonModel,
  mealCarbonModel,
  carCarbonModel,
  flightCarbonModel,
  transportationCarbonModel,
  energyCarbonModel,
  hotelCarbonModel,
  purchaseCarbonModel,
  electricityWorldAverageCarbonModel,
];

export default carbonModels;
