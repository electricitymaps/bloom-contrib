import moment from 'moment';
import {
  TRANSPORTATION_MODE_CAR,
  ACTIVITY_TYPE_TRANSPORTATION,
  EUROCARSEGMENTS,
  ENGINETYPES,
} from '../../definitions';
import cars from './cars.json';
import {
  modelCanRun,
  carbonEmissions,
} from './index';

describe('model runs with unknown car', () => {
  const durationHours = 2;
  const distance = 20;

  const distanceActivity = {
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    distanceKilometers: distance,
    transportationMode: TRANSPORTATION_MODE_CAR,
  };
  const durationActivity = {
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    transportationMode: TRANSPORTATION_MODE_CAR,
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
    expect(carbonEmissions(distanceActivity)).toBeCloseTo(distance * 0.1771);
  });

  test('with duration', () => {
    const durationToDistance = durationHours * 45;
    expect(modelCanRun(durationActivity)).toBeTruthy();
    expect(carbonEmissions(durationActivity)).toBeCloseTo(durationToDistance * 0.1771);
  });
  test('throw on zero duration', () => {
    const zeroDurationActivity = {
      ...durationActivity,
      endDatetime: durationActivity.datetime,
    }

    expect(() => {
      carbonEmissions(zeroDurationActivity)
    }).toThrow();
  });
});

describe('model runs with specific cars', () => {
  const distance = 20;
  const supportedCarSegments = [...EUROCARSEGMENTS, null];
  const supportedEngineTypes = [...ENGINETYPES, null];
  const supportedBrands = [null];
  const activity = {
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
    distanceKilometers: distance,
    transportationMode: TRANSPORTATION_MODE_CAR,
  };

  test(`throw on unsupported car`, () => {
    const unsupportedActivity = {
      ...activity,
      euroCarSegment: 'A',
      engineType: 'thorium-based',
    };
    expect(() => {
      carbonEmissions(unsupportedActivity);
    }).toThrow();
  });

  cars.footprints.forEach(car => {
    const testActivity = { ...activity, ...car };
    test(`${car.euroCarSegment || 'unknown'} segment car with ${car.engineType ||
      'unknown'} engine`, () => {
      expect(supportedCarSegments).toContain(car.euroCarSegment);
      expect(supportedEngineTypes).toContain(car.engineType);
      expect(supportedBrands).toContain(car.brand);
      expect(modelCanRun(testActivity)).toBeTruthy();
      expect(carbonEmissions(testActivity)).toBeCloseTo(distance * car.carbonIntensity);
    });
  });
});
