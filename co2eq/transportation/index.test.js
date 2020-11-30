import {
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
} from '../../definitions';
import { carbonEmissions, modelCanRun } from './index';

describe('model runs', () => {
  describe('for car transportation', () => {
    it('calculates based on distance in kilometers', () => {
      const activity = {
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_CAR,
        distanceKilometers: 200,
      };

      expect(modelCanRun(activity)).toBeTruthy();
      expect(carbonEmissions(activity)).toBeCloseTo(35.42);
    });

    it('calculates based on duration', () => {
      const activity = {
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_CAR,
        datetime: new Date('2020-04-11T10:20:30Z'),
        endDatetime: new Date('2020-04-11T12:20:30Z'),
      };

      expect(modelCanRun(activity)).toBeTruthy();
      expect(carbonEmissions(activity)).toBeCloseTo(15.939);
    });

    it('calculates with a fallback duration', () => {
      const activity = {
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_CAR,
        datetime: new Date('2020-04-11T10:20:30Z'),
      };

      expect(modelCanRun(activity)).toBeTruthy();
      expect(carbonEmissions(activity)).toBeCloseTo(3.0284);
    });

    it('divides emissions by number of participants', () => {
      const activity = {
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_CAR,
        distanceKilometers: 200,
        participants: 3,
      };

      expect(modelCanRun(activity)).toBeTruthy();
      expect(carbonEmissions(activity)).toBeCloseTo(35.42 / 3);
    });

    it('supports roundtrips and doubles emissions', () => {
      const activity = {
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_CAR,
        distanceKilometers: 200,
        isRoundtrip: true,
      };

      expect(modelCanRun(activity)).toBeTruthy();
      expect(carbonEmissions(activity)).toBeCloseTo(35.42 * 2);
    });
  });

  describe('for public transport', () => {
    it('ignores participants', () => {
      const activity = {
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
        distanceKilometers: 200,
        participants: 3,
      };

      expect(modelCanRun(activity)).toBeTruthy();
      expect(carbonEmissions(activity)).toBeCloseTo(14.4999);
    });
    it('supports roundtrips and doubles emissions', () => {
      const activity = {
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
        distanceKilometers: 200,
        isRoundtrip: true,
      };

      expect(modelCanRun(activity)).toBeTruthy();
      expect(carbonEmissions(activity)).toBeCloseTo(14.4999 * 2);
    });
  });
});
