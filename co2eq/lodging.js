import {
  HOTEL_TYPE_ZERO_TO_TWO_STARS,
  HOTEL_TYPE_THREE_STARS,
  HOTEL_TYPE_FOUR_STARS,
  HOTEL_TYPE_FIVE_STARS,
} from '../definitions';

export const modelName = 'lodging';
export const modelVersion = '1';
export const explanation = {
  text: 'Calculations take into account the energy usage of a stay',
  links: [
    { label: 'South Pole', href: 'https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf' },
  ],
};

/*
The carbon intensity is per night stayed
*/
function carbonIntensity(hotelClass) {
  switch (hotelClass) {
    case HOTEL_TYPE_ZERO_TO_TWO_STARS:
      return 11.6;
      // https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf
    case HOTEL_TYPE_THREE_STARS:
      return 14.3;
      // https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf
    case HOTEL_TYPE_FOUR_STARS:
      // https://shop.southpolecarbon.com/uploads/assets/en/_Overnight%20Stays.pdf
      return 18.5 / 1000.0;
    case HOTEL_TYPE_FIVE_STARS:
      return 33.1 / 1000.0;
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
