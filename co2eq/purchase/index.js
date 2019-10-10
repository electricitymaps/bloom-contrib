import {
  PURCHASE_CATEGORY_FOOD_SUPERMARKET,
  PURCHASE_CATEGORY_FOOD_BAKERY,
  PURCHASE_CATEGORY_STORE_DEPARTMENT,
  PURCHASE_CATEGORY_STORE_CLOTHING,
  PURCHASE_CATEGORY_STORE_HARDWARE,
  PURCHASE_CATEGORY_STORE_PET,
  PURCHASE_CATEGORY_STORE_ELECTRONIC,
  PURCHASE_CATEGORY_STORE_BOOKS,
  PURCHASE_CATEGORY_STORE_GARDEN,
  PURCHASE_CATEGORY_STORE_FLORIST,
  PURCHASE_CATEGORY_STORE_BARBER_BEAUTY,
  PURCHASE_CATEGORY_STORE_HOUSE_FURNISHING,
  PURCHASE_CATEGORY_STORE_EQUIPMENT_FURNITURE,
  PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE,
  PURCHASE_CATEGORY_HEALTHCARE_PHARMARCY,
  PURCHASE_CATEGORY_HEALTHCARE_DOCTOR,
  PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARKING,
  PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS,
  PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_SERVICE,
  PURCHASE_CATEGORY_ENTERTAINMENT_CIGAR_STORES,
  PURCHASE_CATEGORY_ENTERTAINMENT_AMUSEMENT_PARKS,
  PURCHASE_CATEGORY_ENTERTAINMENT_MOVIE_THEATER,
  PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL,
  PURCHASE_CATEGORY_ENTERTAINMENT_BAR_NIGHTCLUB,
  PURCHASE_CATEGORY_ENTERTAINMENT_GAMBLING,
  PURCHASE_CATEGORY_ENTERTAINMENT_CRUISE_LINES,
  PURCHASE_CATEGORY_ENTERTAINMENT_LIQUOR_STORE,
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
export const modelVersion = 2; // **** TODO: Model version must be taken from yml???
// *** TODO: If meal depends on footprints.yml, then model version must follow!

/*
  Carbon intensity of category (kg of CO2 per euro spent)
*/
export function carbonIntensity(activity) {
  // Source: http://www.balticproject.org/en/calculator-page
  switch (activity.purchaseCategory) {
    case PURCHASE_CATEGORY_FOOD_SUPERMARKET:
      return 49.02 / 1000;
    case PURCHASE_CATEGORY_FOOD_BAKERY:
      return 63.34 / 1000;
    case PURCHASE_CATEGORY_STORE_DEPARTMENT:
      return 42.93 / 1000;
    case PURCHASE_CATEGORY_STORE_CLOTHING:
      return 29.6 / 1000;
    case PURCHASE_CATEGORY_STORE_HARDWARE:
      return 35.66 / 1000;
    case PURCHASE_CATEGORY_STORE_PET:
      return 63.34 / 1000;
    case PURCHASE_CATEGORY_STORE_ELECTRONIC:
      return 25.22 / 1000;
    case PURCHASE_CATEGORY_STORE_BOOKS:
      return 26.98 / 1000;
    case PURCHASE_CATEGORY_STORE_GARDEN:
      return 36.29 / 1000;
    case PURCHASE_CATEGORY_STORE_FLORIST:
      return 46.96 / 1000;
    case PURCHASE_CATEGORY_STORE_BARBER_BEAUTY:
      return 23.0 / 1000;
    case PURCHASE_CATEGORY_STORE_HOUSE_FURNISHING:
      return 69.49 / 1000;
    case PURCHASE_CATEGORY_STORE_EQUIPMENT_FURNITURE:
      return 36.23 / 1000;
    case PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE:
      return 36.15 / 1000;
    case PURCHASE_CATEGORY_HEALTHCARE_PHARMARCY:
      return 43.87 / 1000;
    case PURCHASE_CATEGORY_HEALTHCARE_DOCTOR:
      return 56.75 / 1000;
    case PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARKING:
      return 195.71 / 1000;
    case PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS:
      return 84.18 / 1000;
    case PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_SERVICE:
      return 42.41 / 1000;
    case PURCHASE_CATEGORY_ENTERTAINMENT_CIGAR_STORES:
      return 46.27 / 1000;
    case PURCHASE_CATEGORY_ENTERTAINMENT_AMUSEMENT_PARKS:
      return 103.14 / 1000;
    case PURCHASE_CATEGORY_ENTERTAINMENT_MOVIE_THEATER:
      return 27.38 / 1000;
    case PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL:
      return 434.79 / 1000;
    case PURCHASE_CATEGORY_ENTERTAINMENT_BAR_NIGHTCLUB:
      return 81.05 / 1000;
    case PURCHASE_CATEGORY_ENTERTAINMENT_GAMBLING:
      return 380.66 / 1000;
    case PURCHASE_CATEGORY_ENTERTAINMENT_CRUISE_LINES:
      return 434.79 / 1000;
    case PURCHASE_CATEGORY_ENTERTAINMENT_LIQUOR_STORE:
      return 80.61 / 1000;
    default:
      throw new Error(`Unknown purchase category: ${activity.purchaseCategory}`);
  }
}

/*
  Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  return (
    (carbonIntensity(activity) * convertToEuro(activity.costAmount, activity.costCurrency))
    / (activity.participants || 1)
  );
}
