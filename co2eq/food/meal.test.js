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
});
