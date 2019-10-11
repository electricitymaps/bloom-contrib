import {
  ACTIVITY_TYPE_MEAL,
  ACTIVITY_TYPE_TRANSPORTATION,
  ACTIVITY_TYPE_PURCHASE,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_TRAIN,
  TRANSPORTATION_MODE_PLANE,
} from '../../definitions';
import { convertToEuro } from '../../integrations/utils/currency/currency';
import footprints from './footprints.yml';

const ENTRY_BY_KEY = {};
export const purchaseIcon = {};

// Traverse and index tree
function indexNodeChildren(branch, i = 1) {
  Object.entries(branch['_children'] || []).forEach(([k, v]) => {
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
    entry = (entry['_children'] || {})[path[i]];
  }
  return entry;
}
export function getDescendants(entry, filter = (_ => true), includeRoot = false) {
  // Note: `getDescendants` is very close to `indexNodeChildren`
  // Note2: if a node gets filtered out, its children won't be visited
  if (!entry) { throw new Error('Invalid `entry`'); }
  let descendants = includeRoot
    ? { [entry.key]: entry }
    : {};
  Object.values(entry['_children'] || []).filter(filter).forEach((child) => {
    descendants = {
      ...descendants,
      ...getDescendants(child, filter, true),
    };
  });
  return descendants;
}


// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'purchase';
export const modelVersion = 2;

/*
  Carbon intensity of category (kg of CO2 per euro spent)
*/
export function carbonIntensity(activity) {
  // Source: http://www.balticproject.org/en/calculator-page
  switch (activity.activityType) {
    case ACTIVITY_TYPE_MEAL:
      return 79.64 / 1000; // Restaurant bill
    case ACTIVITY_TYPE_TRANSPORTATION:
      switch (activity.transportationMode) {
        case TRANSPORTATION_MODE_CAR:
          return 1186 / 1000; // Taxi bill
        case TRANSPORTATION_MODE_TRAIN:
          return 335.63 / 1000;
        case TRANSPORTATION_MODE_PLANE:
          return 1121.52 / 1000;
        default:
          throw new Error(
            `Couldn't calculate purchase carbonIntensity for transporation activity with mode ${activity.transportationMode}`
          );
      }
    case ACTIVITY_TYPE_PURCHASE: {
      const { purchaseType } = activity;
      const entry = getEntryByKey(purchaseType);
      if (!entry) {
        throw new Error(`Unknown purchaseType: ${purchaseType}`);
      }
      if (!entry.intensityKilograms) {
        throw new Error(`Missing carbon intensity for purchaseType: ${purchaseType}`);
      }
      return entry.intensityKilograms;
    }
    default:
      throw new Error(
        `Couldn't calculate purchase carbonIntensity for activityType: ${activity.activityType}`
      );
  }
}

/*
  Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  // TODO: throw error if we're multiplying incompatible units
  return (
    (carbonIntensity(activity) * convertToEuro(activity.costAmount, activity.costCurrency))
    / (activity.participants || 1)
  );
}
