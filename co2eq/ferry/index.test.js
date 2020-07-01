import moment from 'moment';
import {
  TRANSPORTATION_MODE_FERRY,
  ACTIVITY_TYPE_TRANSPORTATION,
} from '../../definitions';
import ferries from './ferries.json';
import { modelCanRun, carbonEmissions } from './index';

describe('model runs with vehicle null', () => {
  // const withVehicle = null;
  const durationHours = 6;
  const distance = 80;

  const distanceActivity = {
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    distanceKilometers: distance,
    transportationMode: TRANSPORTATION_MODE_FERRY,
  };
  const durationActivity = {
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_FERRY,
    datetime: moment(),
    endDatetime: moment().add(durationHours, 'hours'),
  };

  const failingActivity = {
    ...distanceActivity,
    activityType: 'unknown',
  };

  test(`modelCanRun`, () => {
    expect(modelCanRun(distanceActivity)).toBeTruthy();
    expect(modelCanRun(failingActivity)).toBeFalsy();
  });

  test('with distance', () => {
    expect(carbonEmissions(distanceActivity)).toBeCloseTo(distance * 0.11286);
  });

  test('with duration', () => {
    const durationToDistance = durationHours * 30;
    expect(modelCanRun(durationActivity)).toBeTruthy();
    expect(carbonEmissions(durationActivity)).toBeCloseTo(durationToDistance * 0.11286);
  });
  test('throw on zero duration', () => {
    const zeroDurationActivity = {
      ...durationActivity,
      endDatetime: durationActivity.datetime,
    };

    expect(() => {
      carbonEmissions(zeroDurationActivity);
    }).toThrow();
  });
});


describe('model runs with input for vehicle', () => {
  const distance = 100;
  const supportedInputs = [true, false, null];

  const activity = {
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    distanceKilometers: distance,
    transportationMode: TRANSPORTATION_MODE_FERRY,
  };

  test(`throw on unsupported value for withVehicle`, () => {
    const unsupportedActivity = {
      ...activity,
      withVehicle: 'A',
    };
    expect(() => {
      carbonEmissions(unsupportedActivity);
    }).toThrow();
  });


  ferries.footprints.forEach(ferryOption => {
    const testActivity = { ...activity, ...ferryOption };
    test(`${ferries.withVehicle || 'unknown'} as withVehicle input`, () => {
      expect(supportedInputs).toContain(ferryOption.withVehicle);
      expect(modelCanRun(testActivity)).toBeTruthy();
      expect(carbonEmissions(testActivity)).toBeCloseTo(distance * ferryOption.carbonIntensity);
    });
  });
});
