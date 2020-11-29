import {
  ACTIVITY_TYPE_ELECTRIC_HEATING,
  ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
  ACTIVITY_TYPE_ELECTRICITY,
} from '../../definitions';
import { carbonEmissions, modelCanRun } from './worldaverage';

describe('model runs', () => {
  const wattHours = 20;
  test(`with type ELECTRICITY`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_ELECTRICITY,
      energyWattHours: wattHours,
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(0.0095);
  });
  test(`with type VEHICLE_CHARGING`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
      energyWattHours: wattHours,
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(0.0095);
  });
  test(`with type ELECTRIC_HEATING`, () => {
    const activity = {
      activityType: ACTIVITY_TYPE_ELECTRIC_HEATING,
      energyWattHours: wattHours,
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(0.0095);
  });
});
