import {
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_PLANE,
} from '../../definitions';
import { carbonEmissions, modelCanRun } from './index';

test(`test flight with airport codes`, () => {
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
