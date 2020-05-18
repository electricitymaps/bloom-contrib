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
      locationLat: 45.5124,
      locationLon: -73.55468,
    };

    expect(carbonEmissions(activity)).toBe(0.0015);
  });
  test(`with Torontos factor`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: wattHours,
      locationLat: 43.761539,
      locationLon: -79.411079,
    };

    expect(carbonEmissions(activity)).toBe(0.02);
  });
  test(`with New Yorks factor`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: wattHours,
      locationLat: 40.73061,
      locationLon: -73.935242,
    };

    expect(carbonEmissions(activity)).toBeCloseTo(0.2212); // roundup issue here
  });
  test(`with Sidneys factor`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: wattHours,
      locationLat: -33.865143,
      locationLon: 151.2099,
    };

    expect(carbonEmissions(activity)).toBe(0.92);
  });
});
