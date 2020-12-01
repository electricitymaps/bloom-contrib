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

  it('multiplies emissions by number of participants', () => {
    const activity = {
      activityType: ACTIVITY_TYPE_MEAL,
      mealType: MEAL_TYPE_PESCETARIAN,
      participants: 3,
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(1.303 * 3);
  });

  it('ignores invalid number of participants', () => {
    const baseActivity = {
      activityType: ACTIVITY_TYPE_MEAL,
      mealType: MEAL_TYPE_PESCETARIAN,
    };
    const activityWithNegativeParticipants = {
      ...baseActivity,
      participants: -1,
    };
    const activityWithZeroParticipants = {
      ...baseActivity,
      participants: 0,
    };

    expect(modelCanRun(activityWithNegativeParticipants)).toBeTruthy();
    expect(carbonEmissions(activityWithNegativeParticipants)).toBeCloseTo(1.303);

    expect(modelCanRun(activityWithZeroParticipants)).toBeTruthy();
    expect(carbonEmissions(activityWithZeroParticipants)).toBeCloseTo(1.303);
  });
});
