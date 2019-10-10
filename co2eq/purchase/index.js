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
  PURCHASE_CATEGORY_TRANSPORTATION_FUEL,
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
  ACTIVITY_TYPE_MEAL,
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_CAR,
  TRANSPORTATION_MODE_TRAIN,
  TRANSPORTATION_MODE_PLANE,
  ACTIVITY_TYPE_PURCHASE,
} from '../../definitions';
import { convertToEuro } from '../../integrations/utils/currency/currency';

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
    case ACTIVITY_TYPE_PURCHASE:
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
        case PURCHASE_CATEGORY_TRANSPORTATION_FUEL:
          return 1186 / 1000;
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
    default:
      throw new Error(
        `Couldn't calculate purchase carbonIntensity for activity with activityType ${activity.activityType}`
      );
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
