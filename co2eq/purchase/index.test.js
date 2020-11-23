import {
  ACTIVITY_TYPE_PURCHASE,
  ACTIVITY_TYPE_MEAL,
  ACTIVITY_TYPE_TRANSPORTATION,
  ELECTRICITY_ACTIVITIES,
  PURCHASE_CATEGORY_ELECTRICITY,
  PURCHASE_CATEGORY_FOOD_SERVING_SERVICES,
  PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
  PURCHASE_CATEGORY_STORE_FOOD,
  PURCHASE_CATEGORY_OTHER_TRANSPORT_SERVICES,
  PURCHASE_CATEGORY_TRANSPORT_ROAD,
  PURCHASE_CATEGORY_TRANSPORT_RAIL,
  PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT,
  PURCHASE_CATEGORY_TRANSPORT_AIR,
  PURCHASE_CATEGORY_TRANSPORT_BOAT,
  UNIT_CURRENCIES,
  UNIT_MONETARY_EUR,
  UNITS,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_FERRY,
  TRANSPORTATION_MODE_OTHER_TRANSPORT,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_TRAIN,
} from '../../definitions';
import { getDescendants, getRootEntry, modelCanRun, carbonEmissions } from './index';
import { getAvailableCurrencies } from '../../integrations/utils/currency/currency';
import exchangeRates2011 from './exchange_rates_2011.json';

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
    Object.keys(v.conversions).forEach(k => {
      test(`conversion units of ${entryKey}`, () => {
        expect(UNITS).toContain(k);
      });
    });
  });

test(`available currencies match definition`, () => {
  const defined = Object.keys(UNIT_CURRENCIES);
  const available = getAvailableCurrencies();
  expect(defined.sort()).toEqual(available.sort());
});

test(`available 2011 currencies match definition`, () => {
  const defined = Object.keys(UNIT_CURRENCIES);
  const available2011 = Object.keys(exchangeRates2011.rates);
  expect(defined.sort()).toEqual(available2011.sort());
});

test(`test household appliance for DK in EUR`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'DK',
    datetime: new Date('2020-04-11T10:20:30Z'),
    lineItems: [
      {
        unit: UNIT_CURRENCIES.EUR,
        value: 15,
        identifier: PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
      },
    ],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  // original price * cpi correction * intensity
  expect(carbonEmissions(activity)).toBeCloseTo(15 * (95.9 / 103.3) * 0.4028253119428596);
});

test(`test household appliance for DK in EUR, without any date specified`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'DK',
    lineItems: [
      {
        unit: UNIT_CURRENCIES.EUR,
        value: 15,
        identifier: PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
      },
    ],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  // original price * intensity (cpi correction not applied as there is no date)
  expect(carbonEmissions(activity)).toBeCloseTo(15 * 0.4028253119428596);
});

test(`test cpi conversion with a datetime without any cpi`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'DK',
    datetime: new Date('2005-04-11T10:20:30Z'),
    lineItems: [
      {
        unit: UNIT_CURRENCIES.EUR,
        value: 15,
        identifier: PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
      },
    ],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  // original price * intensity (cpi correction not applied as there is no date)
  // expect requires anonymous function here, as it is the function that is expected to throw an error, we are
  // not interested in the return value per se.
  expect(() => carbonEmissions(activity)).toThrowError(
    new Error(`Unknown CPI for activity date ${activity.datetime}`)
  );
});

test(`test household appliance for AU in EUR in 2020, for which there is no cpi data`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'AU',
    datetime: new Date('2020-04-11T10:20:30Z'),
    lineItems: [
      {
        unit: UNIT_CURRENCIES.EUR,
        value: 15,
        identifier: PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
      },
    ],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  // original price * cpi correction * intensity
  // (average fallback used for 2020 as AU does not have data for 2020 yet)
  expect(carbonEmissions(activity)).toBeCloseTo(
    15 * (92.2 / 110.72093023255815) * 0.4428823364363346
  );
});

test(`test household appliance for DK in DKK`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    countryCodeISO2: 'DK',
    datetime: new Date('2020-04-11T10:20:30Z'),
    lineItems: [
      {
        unit: UNIT_CURRENCIES.DKK,
        value: 1150,
        identifier: PURCHASE_CATEGORY_STORE_FOOD,
      },
    ],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  expect(carbonEmissions(activity)).toBeCloseTo(
    (1150 / 7.4506) * (95.9 / 103.3) * 0.817390437852872
  );
});

test(`test non-monetary units (in L)`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    datetime: new Date('2020-04-11T10:20:30Z'),
    lineItems: [{ identifier: 'Diesel', unit: 'L', value: 10 }],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  expect(carbonEmissions(activity)).toBeCloseTo(31.7);
});

test(`test non-monetary units (in kg)`, () => {
  const activity = {
    activityType: ACTIVITY_TYPE_PURCHASE,
    datetime: new Date('2020-04-11T10:20:30Z'),
    lineItems: [{ identifier: 'Butter', unit: 'kg', value: 10 }],
  };
  expect(modelCanRun(activity)).toBeTruthy();
  expect(carbonEmissions(activity)).toBeCloseTo(92.5);
});


describe('test equivalence of activityType=ACTIVITY_TYPE_PURCHASE with other activity types computed using monetary emission factors', () => {

  test(`test equivalence of activityType=ACTIVITY_TYPE_PURCHASE and activityType=ACTIVITY_TYPE_MEAL`, () => {
    const purchaseActivity = {
      activityType: ACTIVITY_TYPE_PURCHASE,
      lineItems: [
        { identifier: PURCHASE_CATEGORY_FOOD_SERVING_SERVICES, unit: UNIT_MONETARY_EUR, value: 10 },
      ],
      costCurrency: UNIT_MONETARY_EUR,
      costAmount: 10,
    };
    const mealActivity = { ...purchaseActivity, activityType: ACTIVITY_TYPE_MEAL };
    expect(modelCanRun(purchaseActivity)).toBeTruthy();
    expect(modelCanRun(mealActivity)).toBeTruthy();
    expect(carbonEmissions(purchaseActivity)).toBeCloseTo(
      carbonEmissions(mealActivity)
    );
  });
  
  
  const TRANSPORTATION_MODE_TO_PURCHASE_IDENTIFIER = {
    [TRANSPORTATION_MODE_CAR]: PURCHASE_CATEGORY_TRANSPORT_ROAD,
    [TRANSPORTATION_MODE_TRAIN]: PURCHASE_CATEGORY_TRANSPORT_RAIL,
    [TRANSPORTATION_MODE_PUBLIC_TRANSPORT]: PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT,
    [TRANSPORTATION_MODE_PLANE]: PURCHASE_CATEGORY_TRANSPORT_AIR,
    [TRANSPORTATION_MODE_FERRY]: PURCHASE_CATEGORY_TRANSPORT_BOAT,
    [TRANSPORTATION_MODE_OTHER_TRANSPORT]: PURCHASE_CATEGORY_OTHER_TRANSPORT_SERVICES,
  };
  Object.entries(TRANSPORTATION_MODE_TO_PURCHASE_IDENTIFIER).forEach(
    ([transportationMode, identifier]) => {
      test(`test equivalence of activityType=ACTIVITY_TYPE_PURCHASE and activityType=ACTIVITY_TYPE_TRANSPORTATION for transportationMode=${transportationMode}`, () => {
        const purchaseActivity = {
          activityType: ACTIVITY_TYPE_PURCHASE,
          lineItems: [{ identifier, unit: UNIT_MONETARY_EUR, value: 10 }],
          costCurrency: UNIT_MONETARY_EUR,
          costAmount: 10,
        };
        const transportationActivity = {
          ...purchaseActivity,
          transportationMode,
          activityType: ACTIVITY_TYPE_TRANSPORTATION,
        };
        expect(modelCanRun(purchaseActivity)).toBeTruthy();
        expect(modelCanRun(transportationActivity)).toBeTruthy();
        expect(carbonEmissions(purchaseActivity)).toBeCloseTo(
          carbonEmissions(transportationActivity)
        );
      });
    }
  );

  ELECTRICITY_ACTIVITIES.forEach(
    activityType => {
      test(`test equivalence of activityType=ACTIVITY_TYPE_PURCHASE and of activityType=${activityType}`, () => {
        const purchaseActivity = {
          activityType: ACTIVITY_TYPE_PURCHASE,
          lineItems: [{ identifier: PURCHASE_CATEGORY_ELECTRICITY, unit: UNIT_MONETARY_EUR, value: 10 }],
          costCurrency: UNIT_MONETARY_EUR,
          costAmount: 10,
        };
        const electricityActivity = {
          ...purchaseActivity,
          activityType,
        };
        expect(modelCanRun(purchaseActivity)).toBeTruthy();
        expect(modelCanRun(electricityActivity)).toBeTruthy();
        expect(carbonEmissions(purchaseActivity)).toBeCloseTo(
          carbonEmissions(electricityActivity)
        );
      })
    }
  )

});
