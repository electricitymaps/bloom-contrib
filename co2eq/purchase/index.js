import {
  ACTIVITY_TYPE_ELECTRIC_HEATING,
  ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
  ACTIVITY_TYPE_ELECTRICITY,
  ACTIVITY_TYPE_MEAL,
  ACTIVITY_TYPE_PURCHASE,
  ACTIVITY_TYPE_TRANSPORTATION,
  ELECTRICITY_ACTIVITIES,
  PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT,
  PURCHASE_CATEGORY_ELECTRICITY,
  PURCHASE_CATEGORY_FOOD_SERVING_SERVICES,
  PURCHASE_CATEGORY_OTHER_TRANSPORT_SERVICES,
  PURCHASE_CATEGORY_TRANSPORT_AIR,
  PURCHASE_CATEGORY_TRANSPORT_BOAT,
  PURCHASE_CATEGORY_TRANSPORT_RAIL,
  PURCHASE_CATEGORY_TRANSPORT_ROAD,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_FERRY,
  TRANSPORTATION_MODE_OTHER_TRANSPORT,
  TRANSPORTATION_MODE_PLANE,
  TRANSPORTATION_MODE_PUBLIC_TRANSPORT,
  TRANSPORTATION_MODE_TRAIN,
  UNIT_ITEM,
  UNIT_KILOGRAMS,
  UNIT_LITER,
  UNIT_MONETARY_EUR,
} from '../../definitions';
import { getAvailableCurrencies } from '../../integrations/utils/currency/currency';
import { getChecksum } from '../utils';
import consumerPriceIndex from './consumerpriceindices.yml';
import exchangeRates2011 from './exchange_rates_2011.json';
import { footprints } from './footprints';

const AVERAGE_CPI_COUNTRY_INDICATOR = 'average';
const COUNTRY_CPI_INDICATOR = 'countries';

export const explanation = {
  text: null,
  links: [
    {
      label: 'Tomorrow footprint database',
      href: 'https://github.com/tmrowco/bloom-contrib/blob/master/co2eq/purchase/footprints.yml',
    },
  ],
};

export const ENTRY_BY_KEY = {};
export const purchaseIcon = {};

// Traverse and index tree
function indexNodeChildren(branch, i = 1) {
  Object.entries(branch._children || []).forEach(([k, v]) => {
    if (ENTRY_BY_KEY[k]) {
      throw new Error(`Error while indexing footprint tree: There's already an entry for ${k}`);
    }
    ENTRY_BY_KEY[k] = v;
    purchaseIcon[k] = v.icon;

    // Also make sure we add additional props
    v.key = k;
    v.level = i;
    v.parentKey = branch.key;
    // Traverse further
    indexNodeChildren(v, i + 1);
  });
}
indexNodeChildren(footprints);

export function getRootEntry() {
  return footprints;
}
export function getEntryByKey(key) {
  return ENTRY_BY_KEY[key];
}
export function getEntryByPath(path) {
  let entry = footprints; // root node
  for (let i = 0; i < path.length; i += 1) {
    entry = (entry._children || {})[path[i]];
  }
  return entry;
}

export function getChecksumOfFootprints() {
  return getChecksum(footprints);
}

export function getDescendants(entry, filter = (_) => true, includeRoot = false) {
  // Note: `getDescendants` is very close to `indexNodeChildren`
  // Note2: if a node gets filtered out, its children won't be visited
  if (!entry) {
    throw new Error('Invalid `entry`');
  }
  let descendants = includeRoot ? { [entry.key]: entry } : {};
  Object.values(entry._children || [])
    .filter(filter)
    .forEach((child) => {
      descendants = {
        ...descendants,
        ...getDescendants(child, filter, true),
      };
    });
  return descendants;
}

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'purchase';
export const modelVersion = `9_${getChecksumOfFootprints()}`; // This model relies on footprints.yaml
export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { costAmount, costCurrency, activityType, transportationMode, lineItems } = activity;
  if (costAmount && costCurrency) {
    if (activityType === ACTIVITY_TYPE_MEAL) {
      return true;
    }
    if (activityType === ACTIVITY_TYPE_TRANSPORTATION) {
      switch (transportationMode) {
        case TRANSPORTATION_MODE_CAR:
        case TRANSPORTATION_MODE_FERRY:
        case TRANSPORTATION_MODE_OTHER_TRANSPORT:
        case TRANSPORTATION_MODE_PLANE:
        case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
        case TRANSPORTATION_MODE_TRAIN:
          return true;
        default:
          return false;
      }
    }
    if (ELECTRICITY_ACTIVITIES.includes(activityType)) {
      return true;
    }
  }
  const hasLineItems = lineItems && lineItems.length > 0;
  const hasIdentifiers = lineItems && lineItems.every((item) => item.identifier);
  if (activityType === ACTIVITY_TYPE_PURCHASE && hasLineItems && hasIdentifiers) {
    return true;
  }

  return false;
}

function correctWithParticipants(footprint, participants) {
  return footprint / (participants || 1);
}

export function convertTo2011Euro(amount, currency) {
  const exchangeRate2011 = exchangeRates2011.rates[currency.toUpperCase()];
  if (exchangeRate2011 == null) {
    throw new Error(`Unknown currency '${currency}'`);
  }
  return amount / exchangeRate2011;
}

function extractEur({ costAmount, costCurrency }) {
  return costAmount && costCurrency ? convertTo2011Euro(costAmount, costCurrency) : null;
}

function conversionCPI(eurAmount, referenceYear, countryCodeISO2, datetime) {
  if (!eurAmount || !datetime) {
    return eurAmount;
  }

  if (!referenceYear) {
    throw new Error(`Missing consumer price index reference year`);
  }

  const currentDateIndicator = datetime.getFullYear();

  let CPIcurrent;
  if (
    countryCodeISO2 &&
    consumerPriceIndex[COUNTRY_CPI_INDICATOR][countryCodeISO2][currentDateIndicator]
  ) {
    CPIcurrent = consumerPriceIndex[COUNTRY_CPI_INDICATOR][countryCodeISO2][currentDateIndicator];
  } else if (consumerPriceIndex[AVERAGE_CPI_COUNTRY_INDICATOR][currentDateIndicator]) {
    CPIcurrent = consumerPriceIndex[AVERAGE_CPI_COUNTRY_INDICATOR][currentDateIndicator];
  } else {
    throw new Error(`Unknown CPI for activity date ${datetime}`);
  }

  let CPIreference;
  if (
    countryCodeISO2 &&
    consumerPriceIndex[COUNTRY_CPI_INDICATOR][countryCodeISO2][referenceYear]
  ) {
    CPIreference = consumerPriceIndex[COUNTRY_CPI_INDICATOR][countryCodeISO2][referenceYear];
  } else if (consumerPriceIndex[AVERAGE_CPI_COUNTRY_INDICATOR][referenceYear]) {
    CPIreference = consumerPriceIndex[AVERAGE_CPI_COUNTRY_INDICATOR][referenceYear];
  } else {
    throw new Error(`Unknown CPI for reference year ${referenceYear}`);
  }

  // ref: https://www.investopedia.com/terms/c/consumerpriceindex.asp
  const eurAmountAdjusted = eurAmount * (CPIreference / CPIcurrent);
  return eurAmountAdjusted;
}

/**
 * Returns the compatible unit and amounts of a line item
 * @param {*} lineItem - Object of the the type { name: <string>, unit: <string>, value: <string>, costAmount: <float>, costCurrency: <string> }
 * @param {*} entry - A purchase entry
 * @param {*} countryCodeISO2 - country code of the activity
 * @param {*} datetime - datetime of the activity
 */
function extractCompatibleUnitAndAmount(lineItem, entry, countryCodeISO2, datetime) {
  const isMonetaryItem = getAvailableCurrencies().includes(lineItem.unit);
  // Extract eurAmount if applicable
  let eurAmount = extractEur({
    costCurrency: isMonetaryItem ? lineItem.unit : null,
    costAmount: isMonetaryItem ? lineItem.value : null,
  });
  if (eurAmount) {
    eurAmount = conversionCPI(eurAmount, entry.year, countryCodeISO2, datetime);
  }
  const availableEntryUnit = entry.unit;
  if (availableEntryUnit === UNIT_LITER && lineItem.unit === UNIT_LITER) {
    return { unit: UNIT_LITER, amount: lineItem.value };
  }
  if (availableEntryUnit === UNIT_KILOGRAMS && lineItem.unit === UNIT_KILOGRAMS) {
    return { unit: UNIT_KILOGRAMS, amount: lineItem.value };
  }
  if (availableEntryUnit === UNIT_MONETARY_EUR && eurAmount != null) {
    return { unit: UNIT_MONETARY_EUR, amount: eurAmount };
  }
  if (availableEntryUnit === UNIT_ITEM) {
    return { unit: UNIT_ITEM, amount: 1 };
  }
  throw new Error(`Line item of activity has no compatible purchase unit.`);
}

/**
 * Calculates the carbon emissions of a line item entry
 * @param {*} lineItem - Object of the the type { identifier: <string>, unit: <string>, value: <string>, costAmount: <float>, costCurrency: <string> }
 * @param {*} countryCodeISO2 - country code of the activity
 * @param {*} datetime - datetime of the activity
 */
export function carbonEmissionOfLineItem(lineItem, countryCodeISO2, datetime) {
  // The generic identifier property holds the purchaseType value, so rename to make clear..
  const { identifier } = lineItem;
  const entry = getEntryByKey(identifier);
  if (!entry) {
    throw new Error(`Unknown purchaseType identifier: ${identifier}`);
  }
  if (!entry.intensityKilograms) {
    throw new Error(`Missing carbon intensity for purchaseType: ${identifier}`);
  }

  const { unit, amount } = extractCompatibleUnitAndAmount(
    lineItem,
    entry,
    countryCodeISO2,
    datetime
  );
  if (unit == null || amount == null || !Number.isFinite(amount)) {
    throw new Error(
      `Invalid unit ${unit} or amount ${amount} for purchaseType ${identifier}. Expected ${entry.unit}`
    );
  }

  if (entry.unit !== unit) {
    throw new Error(
      `Invalid unit ${unit} given for purchaseType ${identifier}. Expected ${entry.unit}`
    );
  }

  if (typeof entry.intensityKilograms === 'number') {
    return entry.intensityKilograms * amount;
  }
  if (entry.unit !== UNIT_MONETARY_EUR) {
    throw new Error(`Invalid unit ${entry.unit} given. Expected ${UNIT_MONETARY_EUR}`);
  }
  if (!countryCodeISO2) {
    // Use average of all countries
    // TODO: weight by the GDP of countries or by population
    const values = Object.values(entry.intensityKilograms);
    return (values.reduce((a, b) => a + b, 0) / values.length) * amount;
  }
  if (!entry.intensityKilograms[countryCodeISO2]) {
    throw new Error(
      `Missing carbon intensity for country ${countryCodeISO2} and identifier ${identifier}`
    );
  }
  return entry.intensityKilograms[countryCodeISO2] * amount;
}

/*
  Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  let footprint;

  switch (activity.activityType) {
    case ACTIVITY_TYPE_MEAL:
      footprint = carbonEmissionOfLineItem(
        {
          identifier: PURCHASE_CATEGORY_FOOD_SERVING_SERVICES,
          unit: activity.costCurrency,
          value: activity.costAmount,
        },
        activity.countryCodeISO2,
        activity.datetime
      );
      break;

    case ACTIVITY_TYPE_TRANSPORTATION: {
      let identifier;
      switch (activity.transportationMode) {
        case TRANSPORTATION_MODE_CAR:
          identifier = PURCHASE_CATEGORY_TRANSPORT_ROAD; // Taxi bill
          break;
        case TRANSPORTATION_MODE_TRAIN:
          identifier = PURCHASE_CATEGORY_TRANSPORT_RAIL;
          break;
        case TRANSPORTATION_MODE_PUBLIC_TRANSPORT:
          identifier = PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT;
          break;
        case TRANSPORTATION_MODE_OTHER_TRANSPORT:
          identifier = PURCHASE_CATEGORY_OTHER_TRANSPORT_SERVICES;
          break;
        case TRANSPORTATION_MODE_PLANE:
          identifier = PURCHASE_CATEGORY_TRANSPORT_AIR;
          break;
        case TRANSPORTATION_MODE_FERRY:
          identifier = PURCHASE_CATEGORY_TRANSPORT_BOAT;
          break;
        default:
          throw new Error(
            `Couldn't calculate purchase carbonIntensity for transporation activity with mode ${activity.transportationMode}`
          );
      }

      footprint = carbonEmissionOfLineItem(
        {
          identifier,
          unit: activity.costCurrency,
          value: activity.costAmount,
        },
        activity.countryCodeISO2,
        activity.datetime
      );
      break;
    }

    case ACTIVITY_TYPE_ELECTRICITY:
    case ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING:
    case ACTIVITY_TYPE_ELECTRIC_HEATING: {
      footprint = carbonEmissionOfLineItem(
        {
          identifier: PURCHASE_CATEGORY_ELECTRICITY,
          unit: activity.costCurrency,
          value: activity.costAmount,
        },
        activity.countryCodeISO2,
        activity.datetime
      );
      break;
    }

    case ACTIVITY_TYPE_PURCHASE: {
      const { lineItems, countryCodeISO2, datetime } = activity;

      // First check if lineItems contains and calculate total of all line items
      if (lineItems && lineItems.length) {
        // TODO(df): What to do on a single line error? Abort all? Skip item?
        footprint = lineItems
          .map((l) => carbonEmissionOfLineItem(l, countryCodeISO2, datetime))
          .reduce((a, b) => a + b, 0);
      }
      break;
    }

    default:
      throw new Error(
        `Couldn't calculate purchase carbonIntensity for activityType: ${activity.activityType}`
      );
  }

  return correctWithParticipants(footprint, activity.participants);
}
