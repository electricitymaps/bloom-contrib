import { ACTIVITY_TYPE_MEAL, MEAL_TYPE_PESCETARIAN } from '../../definitions';
import { carbonEmissions, modelCanRun } from './meal';

describe('model runs', () => {
  it('calculates based on meal type', () => {
    const activity = {
      activityType: ACTIVITY_TYPE_MEAL,
      mealType: MEAL_TYPE_PESCETARIAN,
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(1.303);
  });

  it('throws on non existing meal type', () => {
    const activity = {
      activityType: ACTIVITY_TYPE_MEAL,
      mealType: 'not-real',
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(() => carbonEmissions(activity)).toThrowError('Unknown meal type: not-real');
  });

  it('multiplies emissions by number of numberOfMeals', () => {
    const activity = {
      activityType: ACTIVITY_TYPE_MEAL,
      mealType: MEAL_TYPE_PESCETARIAN,
      numberOfMeals: 3,
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(1.303 * 3);
  });

  it('ignores invalid number of numberOfMeals', () => {
    const baseActivity = {
      activityType: ACTIVITY_TYPE_MEAL,
      mealType: MEAL_TYPE_PESCETARIAN,
    };
    const activityWithNegativeNumberOfMeals = {
      ...baseActivity,
      numberOfMeals: -1,
    };
    const activityWithZeroNumberOfMeals = {
      ...baseActivity,
      numberOfMeals: 0,
    };

    expect(modelCanRun(activityWithNegativeNumberOfMeals)).toBeTruthy();
    expect(carbonEmissions(activityWithNegativeNumberOfMeals)).toBeCloseTo(1.303);

    expect(modelCanRun(activityWithZeroNumberOfMeals)).toBeTruthy();
    expect(carbonEmissions(activityWithZeroNumberOfMeals)).toBeCloseTo(1.303);
  });
});
