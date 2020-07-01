import * as electricityWorldAverageCarbonModel from './electricity/worldaverage';
import * as mealCarbonModel from './food/meal';
import * as ingredientsCarbonModel from './food/ingredients';
import * as transportationCarbonModel from './transportation/index';
import * as flightCarbonModel from './flights/index';
import * as carCarbonModel from './car/index';
import * as ferryCarbonModel from './ferry/index';
import * as purchaseCarbonModel from './purchase/index';
import * as energyCarbonModel from './energy/index';
import * as hotelCarbonModel from './hotelpercountry/index';

// Note: fallback models must be at the end
const carbonModels = [
  ingredientsCarbonModel,
  mealCarbonModel,
  carCarbonModel,
  flightCarbonModel,
  ferryCarbonModel,
  transportationCarbonModel,
  energyCarbonModel,
  hotelCarbonModel,
  purchaseCarbonModel,
  electricityWorldAverageCarbonModel,
];

export default carbonModels;
