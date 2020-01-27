import {
  HOTEL_CLASS_ZERO_TO_TWO_STARS,
  HOTEL_CLASS_THREE_STARS,
  HOTEL_CLASS_FOUR_STARS,
  HOTEL_CLASS_FIVE_STARS,
} from '../definitions';

export const modelName = 'lodging';
export const modelVersion = '1';
export const explanation = {
  text: 'Calculations take into account the energy usage of a stay',
  links: [
    { label: 'UK GOV DEFRA (2009)', href: 'https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf' },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { hotelClass, durationHours } = activity;
  if (hotelClass && durationHours) {
    return true;
  }

  return false;
}
/*
The carbon intensity is per night stayed
*/
function carbonIntensity(hotelClass) {
  switch (hotelClass) {
    case HOTEL_CLASS_ZERO_TO_TWO_STARS:
      return 11.6;
      // https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf
    case HOTEL_CLASS_THREE_STARS:
      return 14.3;
      // https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf
    case HOTEL_CLASS_FOUR_STARS:
      // https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf
      return 18.5;
    case HOTEL_CLASS_FIVE_STARS:
      return 33.1;
      // https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf
    default:
      throw new Error(`Unknown hotel class: ${hotelClass}`);
  }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  return carbonIntensity(activity.hotelClass) * Math.ceil(activity.durationHours / 24);
}
