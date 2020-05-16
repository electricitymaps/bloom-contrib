import { ACTIVITY_TYPE_ELECTRICITY } from '../../definitions';
import { carbonEmissions } from './worldaverage';

describe('model uses emission factor', () => {
  const wattHours = 1000;
  test(`with default`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: wattHours,
    };

    expect(carbonEmissions(activity)).toBe(0.475);
  });
  test(`with Montreals factor`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: wattHours,
      locationLon: -73.55468,
      locationLat: 45.5124,
    };

    expect(carbonEmissions(activity)).toBe(0.0015);
  });
});
