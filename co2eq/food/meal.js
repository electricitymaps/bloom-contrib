import {
  MEAL_TYPE_MEAT_HIGH,
  MEAL_TYPE_MEAT_LOW,
  MEAL_TYPE_MEAT_MEDIUM,
  MEAL_TYPE_MEAT_OR_FISH,
  MEAL_TYPE_PESCETARIAN,
  MEAL_TYPE_VEGAN,
  MEAL_TYPE_VEGETARIAN,
} from '../../definitions';

const MEALS_PER_DAY = 3;

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'meal';
export const modelVersion = '6';
export const explanation = {
  text:
    'The calculations take into consideration greenhouse gas emissions across the whole lifecycle for an average meal of a specific diet.',
  links: [{ label: 'Nature (2017)', href: 'https://www.nature.com/articles/s41598-017-06466-8' }],
};

export const modelCanRunVersion = 2;
export function modelCanRun(activity) {
  const { mealType } = activity;
  if (mealType) {
    return true;
  }

  return false;
}

/*
Carbon intensity of meals (kgCO2 per meal).
// Source: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4372775/
The values are age-and-sex-adjusted means per 2000 kcal.
*/
function carbonIntensityOfMealType(mealType) {
  switch (mealType) {
    case MEAL_TYPE_VEGAN:
      return 2890.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_VEGETARIAN:
      return 3810.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_PESCETARIAN:
      return 3910.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_MEAT_LOW:
      return 4770.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_MEAT_MEDIUM:
      return 5630.0 / MEALS_PER_DAY / 1000.0;
    case MEAL_TYPE_MEAT_HIGH:
      return 7190.0 / MEALS_PER_DAY / 1000.0;
    // Source: https://www.nature.com/articles/s41598-017-06466-8
    // should be removed as inconsistent with previous source.
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

  if (mealType) {
    return carbonIntensityOfMealType(mealType);
  }

  throw new Error(
    "Couldn't calculate carbonEmissions for activity because it does not have any ingredients or meal type"
  );
}
