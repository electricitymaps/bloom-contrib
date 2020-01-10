import countries from "./countries.json";

export const modelName = 'hotelpercountry';
export const modelVersion = '1';
export const explanation = {
  text: 'Calculations take into account the emissions of a stay depending of the country',
  links: [
    { label: 'UK Government Conversion Factor', href: 'https://docs.google.com/spreadsheets/d/1f1j9EeVn9czOZBJKLXvgPwnmldakxuJ7/edit#gid=1584958883' },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { countryCodeISO2, durationHours } = activity;
  if (countryCodeISO2 && durationHours) {
    if(countries.countries[activity.countryCodeISO2.toUpperCase()]){
      return true;
    }
  }
  return false;
}

/*
The carbon intensity is per night stayed for one room
*/
function carbonIntensity(activity){
    //The data for all the countries can be found here: 
    //https://docs.google.com/spreadsheets/d/1f1j9EeVn9czOZBJKLXvgPwnmldakxuJ7/edit#gid=1584958883
    //Source for the division of the "Caribbean region" in ISO2 country codes: (2020, January 9). Carribean. Retrieved from https://en.wikipedia.org/wiki/Caribbean
    if(!countries.countries[activity.countryCodeISO2.toUpperCase()].hotelFtPrint){
      //There is no data for that specific area, so the median of all the values given in the above document is returned
      return 40.3
    }
    else{
        return countries.countries[activity.countryCodeISO2.toUpperCase()].hotelFtPrint;
    }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
    return carbonIntensity(activity) * Math.ceil(activity.durationHours / 24);
  }