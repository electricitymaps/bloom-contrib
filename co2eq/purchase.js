import {
  PURCHASE_CATEGORY_FOOD_SUPERMARKET,
  PURCHASE_CATEGORY_FOOD_RESTAURANT,
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
  PURCHASE_CATEGORY_TRANSPORTATION_TAXI,
  PURCHASE_CATEGORY_TRANSPORTATION_RAILROAD,
  PURCHASE_CATEGORY_TRANSPORTATION_AIRLINES,
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
} from '../definitions';
import { convertToEuro } from '../integrations/utils/currency/currency';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'purchase';
export const modelVersion = 1;



const CARBON_INTENSITY = { // kgCO2eq / item
/*
Source for Apple: https://www.apple.com/lae/environment/ there are more old models
*/
// Phones
  'Apple, iPhone 11 Pro Max': 86, // including 18% use, https://www.apple.com/lae/environment/pdf/products/iphone/iPhone_11_Pro_Max_PER_sept2019.pdf
  'Apple, iPhone 11 Pro': 80, // including 13% use, https://www.apple.com/lae/environment/pdf/products/iphone/iPhone_11_Pro_PER_sept2019.pdf
  'Apple, iPhone 11': 72, // including 17% use, https://www.apple.com/lae/environment/pdf/products/iphone/iPhone_11_PER_sept2019.pdf
  'Apple, iPhone XR': 62, // including 19% use, https://www.apple.com/lae/environment/pdf/products/iphone/iPhone_XR_PER_sept2018.pdf
  'Apple, iPhone 8': 57, // including 16% use, https://www.apple.com/lae/environment/pdf/products/iphone/iPhone_8_PER_sept2017.pdf
  'Apple, iPhone 8 Plus': 68, // including 17% use, https://www.apple.com/lae/environment/pdf/products/iphone/iPhone_8_Plus_PER_sept2017.pdf
// Tablets
  'Apple, iPad Pro (12.9-inch) (3rd generation)': 136, // including 6% use, https://www.apple.com/lae/environment/pdf/products/ipad/iPadPro_12.9-inch_PER_oct2018.pdf
  'Apple, iPad Pro (11-inch)': 113, // including 5% use, https://www.apple.com/lae/environment/pdf/products/ipad/iPadPro_11-inch_PER_oct2018.pdf
  'Apple, iPad (7th generation)': 87, // including 14% use, https://www.apple.com/lae/environment/pdf/products/ipad/iPad_PER_sept2019.pdf
  'Apple, iPad Air (3rd generation)': 86, // including 13% use, https://www.apple.com/lae/environment/pdf/products/ipad/iPadAir_PER_Mar2019.pdf
  'Apple, iPad mini (5th generation)': 70, // including 15% use, https://www.apple.com/lae/environment/pdf/products/ipad/iPadmini_PER_Mar2019.pdf
// Watches
  'Apple, Apple Watch Series 5 (GPS + Cellular)': 40, // including 13% use, https://www.apple.com/lae/environment/pdf/products/watch/Apple_Watch_Series5_PER_sept2019.pdf
  'Apple, Apple Watch Series 3 (GPS + Cellular)': 36, // including 15% use, https://www.apple.com/lae/environment/pdf/products/watch/Apple_Watch_Series3_GPSCellular_PER_sept2018.pdf
  'Apple, Apple Watch Series 3 (GPS)': 28, // including 20% use, https://www.apple.com/lae/environment/pdf/products/watch/Apple_Watch_Series3_GPS_PER_sept2018.pdf
// Laptop computers 
  'Apple, MacBook Pro 15-inch': 334, // including 21% use, https://www.apple.com/lae/environment/pdf/products/notebooks/15-inch_MacBookPro_PER_may2019.pdf
  'Apple, MacBook Pro 13-inch': 210, // including 6% use, https://www.apple.com/lae/environment/pdf/products/notebooks/13-inch_MacBookPro_PER_June2019.pdf
  'Apple, MacBook Air 13-inch': 176, // including 6% use, https://www.apple.com/lae/environment/pdf/products/notebooks/13-inch_MacBookAir_w_Retina_PER_June2019.pdf
// Desktop computers 
  'Apple, iMac 27-inch': 993, // including 55% use, https://www.apple.com/lae/environment/pdf/products/desktops/27-inch_iMac_with_Retina5KDisplay_PER_Mar2019.pdf
  'Apple, iMac 21.5-inch with Retina 4k': 588, // including 51% use, https://www.apple.com/lae/environment/pdf/products/desktops/21.5-inch_iMac_with_Retina4KDisplay_PER_Mar2019.pdf
  'Apple, iMac 21.5-inch': 494, // including 54% use, https://www.apple.com/lae/environment/pdf/products/desktops/21.5-inch_iMac_PER_June2017.pdf
  'Apple, iMac Pro': 1468, // including 54% use, https://www.apple.com/lae/environment/pdf/products/desktops/iMac_Pro_PER_dec2017.pdf
  'Apple, Mac Pro': 1000, // including 50% use, https://www.apple.com/lae/environment/pdf/products/desktops/MacPro_PER_June2017.pdf
  'Apple, Mac mini': 226, // including 3% use, https://www.apple.com/lae/environment/pdf/products/desktops/Macmini_PER_oct2018.pdf
// Speakers
  'Apple, Homepod': 146, // including 41% use, https://www.apple.com/lae/environment/pdf/products/homepod/HomePod_PER_feb2018.pdf
// Set top boxes 
  'Apple, Apple TV 4K': 58, // including 29% use, https://www.apple.com/lae/environment/pdf/products/appletv/Apple_TV_4K_PER_sept2017.pdf
  'Apple, Apple TV': 65, // including 30% use, https://www.apple.com/lae/environment/pdf/products/appletv/Apple_TV_PER_sept2017.pdf
// Music players
  'Apple, iPod touch': 32, // including 6% use, https://www.apple.com/lae/environment/pdf/products/ipod/iPodtouch_PER_may2019.pdf
// Internet routers
  'Apple, AirPort Extreme': 250, // including 76% use, https://www.apple.com/lae/environment/pdf/products/airport/AirPortExtreme_PER_june2013.pdf
  'Apple, AirPort Time Capsule': 310, // including 70% use, https://www.apple.com/lae/environment/pdf/products/airport/AirPortTimeCapsule_PER_june2013.pdf
  'Apple, AirPort Express': 95, // including 60% use, https://www.apple.com/lae/environment/pdf/products/airport/AirPortExpress_PER_june2012.pdf
};

/*
  Carbon intensity of category (kg of CO2 per euro spent)
*/
export function carbonIntensity(category) {
  // Source: http://www.balticproject.org/en/calculator-page

  switch (category) {
    case PURCHASE_CATEGORY_FOOD_SUPERMARKET:
      return 49.02 / 1000;
    case PURCHASE_CATEGORY_FOOD_RESTAURANT:
      return 79.64 / 1000;
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
    case PURCHASE_CATEGORY_TRANSPORTATION_TAXI:
      return 1186 / 1000;
    case PURCHASE_CATEGORY_TRANSPORTATION_RAILROAD:
      return 335.63 / 1000;
    case PURCHASE_CATEGORY_TRANSPORTATION_AIRLINES:
      return 1121.52 / 1000;
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
      throw new Error(`Unknown purchase category: ${category}`);
  }
}

/*
  Carbon emissions of an activity (in kgCO2eq)
  */
export function carbonEmissions(activity) {
  let category = activity.purchaseCategory;

  if (!category) {
    if (activity.activityType === ACTIVITY_TYPE_MEAL) {
      category = PURCHASE_CATEGORY_FOOD_RESTAURANT;
    } else if (activity.activityType === ACTIVITY_TYPE_TRANSPORTATION) {
      if (activity.transportationMode === TRANSPORTATION_MODE_CAR) {
        category = PURCHASE_CATEGORY_TRANSPORTATION_TAXI;
      } else if (activity.activityType === TRANSPORTATION_MODE_TRAIN) {
        category = PURCHASE_CATEGORY_TRANSPORTATION_RAILROAD;
      } else if (activity.activityType === TRANSPORTATION_MODE_PLANE) {
        category = PURCHASE_CATEGORY_TRANSPORTATION_AIRLINES;
      }
    } else {
      throw new Error(`Couldn't find any purchaseCategory for activity with type ${activity.activityType}`);
    }
  }

  return (carbonIntensity(category) * convertToEuro(activity.costAmount, activity.costCurrency)) / (activity.participants || 1);
}
