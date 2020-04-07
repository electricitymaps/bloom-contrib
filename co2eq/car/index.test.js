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
  modelName,
  modelVersion,
  explanation,
  modelCanRunVersion,
} from './index';

test(`model has valid API`, () => {
  expect(modelName).toBeDefined();
  expect(modelVersion).toBeDefined();
  expect(explanation).toBeDefined();
  expect(modelCanRunVersion).toBeDefined();
  expect(modelCanRun).toBeDefined();
  expect(carbonEmissions).toBeDefined();
});

describe('model runs with unknown car', () => {
  test(`with duration`, () => {
    const durationHours = 2;
    const activity = {
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      transportationMode: TRANSPORTATION_MODE_CAR,
      datetime: moment(),
      endDatetime: moment().add(durationHours, 'hours'),
    };

    const expectedCO2 = durationHours * 45;
    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(expectedCO2 * 0.1771);
  });
  test(`with distance`, () => {
    const distance = 20;
    const activity = {
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      distanceKilometers: distance,
      transportationMode: TRANSPORTATION_MODE_CAR,
    };
    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(distance * 0.1771);
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
