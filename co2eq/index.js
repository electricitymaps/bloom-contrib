import * as electricityWorldAverageCarbonModel from './electricity/worldaverage';
import * as mealCarbonModel from './food/meal';
import * as ingredientsCarbonModel from './food/ingredients';
import * as transportationCarbonModel from './transportation/index';
import * as flightCarbonModel from './flights/index';
import * as carCarbonModel from './car/index';
import * as purchaseCarbonModel from './purchase/index';
import * as energyCarbonModel from './energy/index';
import * as hotelCarbonModel from './hotelpercountry/index';
import * as emailCarbonModel from './digital/email';

// Note: fallback models must be at the end
const carbonModels = [
  emailCarbonModel,
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
