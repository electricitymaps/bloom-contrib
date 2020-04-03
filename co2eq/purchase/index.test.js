import {
  UNITS,
  PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
  UNIT_MONETARY_EUR,
  ACTIVITY_TYPE_PURCHASE,
} from '../../definitions';
import { getDescendants, getRootEntry, modelCanRun, carbonEmissions } from './index';


Object.entries(getDescendants(getRootEntry()))
  .filter(([k, v]) => v.unit)
  .forEach(([k, v]) => {
    test(`default unit of ${k}`, () => {
      expect(UNITS).toContain(v.unit);
    });
  });

Object.entries(getDescendants(getRootEntry()))
  .filter(([k, v]) => v.conversions)
  .forEach(([entryKey, v]) => {
    Object.keys(v.conversions)
      .forEach((k) => {
        test(`conversion units of ${entryKey}`, () => {
          expect(UNITS).toContain(k);
        });
      });
  });

test(`test household appliance for DK in EUR`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'DK',
    lineItems: [{ unit: UNIT_MONETARY_EUR, value: 15, identifier: PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE }]
  };
  expect(modelCanRun(activity)).toBeTruthy();
  expect(carbonEmissions(activity)).toBeCloseTo(15 * 0.4028253119428596);
});
