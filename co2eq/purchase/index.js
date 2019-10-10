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
export const modelVersion = 2;

/*
  Carbon intensity of category (kg of CO2 per euro spent)
*/
export function carbonIntensity(activity) {
  // Source: http://www.balticproject.org/en/calculator-page
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
