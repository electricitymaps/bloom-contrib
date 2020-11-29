import { ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_PLANE } from '../../definitions';
import { carbonEmissions, modelCanRun } from './index';

describe('model runs', () => {
  it('calculates based on airport codes', () => {
    const activity = {
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      transportationMode: TRANSPORTATION_MODE_PLANE,
      datetime: new Date('2020-04-11T10:20:30Z'),
      departureAirportCode: 'ATH',
      destinationAirportCode: 'CPH',
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(483.07621051458455);
  });
  it('throws on non existing airport code', () => {
    const activity = {
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      transportationMode: TRANSPORTATION_MODE_PLANE,
      datetime: new Date('2020-04-11T10:20:30Z'),
      departureAirportCode: 'ATH',
      destinationAirportCode: 'not-real',
    };
    expect(modelCanRun(activity)).toBeTruthy();

    expect(() => carbonEmissions(activity)).toThrowError('Unknown airport code not-real');
  });

  it('calculates based on distance in kilometers', () => {
    const activity = {
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      transportationMode: TRANSPORTATION_MODE_PLANE,
      distanceKilometers: 2000,
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(345.9374385616095);
  });

  it('calculates based on duration', () => {
    const activity = {
      activityType: ACTIVITY_TYPE_TRANSPORTATION,
      transportationMode: TRANSPORTATION_MODE_PLANE,
      datetime: new Date('2020-04-11T10:20:30Z'),
      endDatetime: new Date('2020-04-11T12:20:30Z'),
    };

    expect(modelCanRun(activity)).toBeTruthy();
    expect(carbonEmissions(activity)).toBeCloseTo(236.74911026391652);
  });
});
