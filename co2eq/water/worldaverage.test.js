import { ACTIVITY_TYPE_WATER } from '../../definitions';

import { modelCanRun, carbonEmissions } from './worldaverage';

describe('model runs', () => {
  const cubicMeters = 20;
  test(`with type WATER`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_WATER,
      waterCubicMeters: cubicMeters,
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBe(20.8);
  });
});
