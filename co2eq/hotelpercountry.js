import countries from './countries.json';
import { ACTIVITY_TYPE_PURCHASE, PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL } from '../definitions';

export const modelName = 'hotelpercountry';
export const modelVersion = '1';
export const explanation = {
  text: 'Calculations take into account the emissions of a stay depending of the country',
  links: [
    { label: 'UK GOV DEFRA (2009)', href: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019' },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const {
    countryCodeISO2,
    durationHours,
    activityType,
    purchaseType,
  } = activity;
  if (activityType === ACTIVITY_TYPE_PURCHASE
    && purchaseType === PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL
    && countryCodeISO2
    && durationHours
  ) {
    if (countries.countries[activity.countryCodeISO2.toUpperCase()]) {
      return true;
    }
  }
  return false;
}

/*
The carbon intensity is per night stayed for one room
*/
function carbonIntensity(activity) {
  // The data for all the countries can be found here: 
  // https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
  // Source for the division of the "Caribbean region" in ISO2 country codes: (2020, January 9). Carribean. Retrieved from https://en.wikipedia.org/wiki/Caribbean
  let valuePerRoom = 40.3; // This default value is the median of all the values given in the above document
  if (countries.countries[activity.countryCodeISO2.toUpperCase()].hotelFootprintKilogramsPerHotelNight) {
    valuePerRoom = countries.countries[activity.countryCodeISO2.toUpperCase()].hotelFootprintKilogramsPerHotelNight;
  }
  return valuePerRoom / (activity.participants || 1);
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  return carbonIntensity(activity) * Math.ceil(activity.durationHours / 24);
}
