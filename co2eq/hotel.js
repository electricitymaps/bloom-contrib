import{
    ARGENTINA,
    AUSTRALIA,
    AUSTRIA,
    BELGIUM,
    BRAZIL,
    CANADA,
    CARIBBEAN,
    CHILE,
    CHINA,
    CHINA_HONGKONG,
    COLOMBIA,
    COSTA_RICA,
    CZECH_REPUBLIC,
    EGYPT,
    FRANCE,
    GERMANY,
    GREECE,
    INDIA,
    INDONESIA,
    IRELAND,
    ISRAEL,
    ITALY,
    JAPAN,
    JORDAN,
    MALAYSIA,
    MEXICO,
    NETHERLANDS,
    NEW_ZEALAND,
    PANAMA,
    PHILIPPINES,
    POLAND,
    PORTUGAL,
    QATAR,
    RUSSIA,
    SAUDI_ARABIA,
    SINGAPORE,
    SOUTH_AFRICA,
    SOUTH_KOREA,
    SPAIN,
    SWITZERLAND,
    TAIWAN,
    THAILAND,
    TURKEY,
    UNITED_ARAB_EMIRATES,
    UNITED_KINGDON,
    UK_LONDON,
    UNITED_STATES,
    VIETNAM
} from '../definitions';

export const modelName = 'hotel';
export const modelVersion = '1';
export const explanation = {
  text: 'Calculations take into account the emissions of a stay depending of the country',
  links: [
    { label: 'UK Government Conversion Factor', href: 'https://docs.google.com/spreadsheets/d/1f1j9EeVn9czOZBJKLXvgPwnmldakxuJ7/edit#gid=1584958883' },
  ],
};

/*
The carbon intensity is per night stayed for one room
*/
function carbonIntensity(country){
  switch (country){
    //The data for all the following countries can be found here: 
    //https://docs.google.com/spreadsheets/d/1f1j9EeVn9czOZBJKLXvgPwnmldakxuJ7/edit#gid=1584958883
    case ARGENTINA:
      return 52.8;
    case AUSTRALIA:
      return 44.9;
    case AUSTRIA:
      return 18.3;
    case BELGIUM:
      return 19.6;
    case BRAZIL:
      return 14.9;
    case CANADA:
      return 15.5;
    case CARIBBEAN:
      return 64.6;
    case CHILE:
      return 40.4;
    case CHINA:
      return 63.8;
    case CHINA_HONGKONG:
      return 77.0;
    case COLOMBIA:
      return 14.3;
    case COSTA_RICA:
      return 13.7;
    case CZECH_REPUBLIC:
      return 29.7;
    case EGYPT:
      return 70.0;
    case FRANCE:
      return 7.6;
    case GERMANY:
      return 20.8;
    case GREECE:
      return 46.9;
    case INDIA:
      return 86.7;
    case INDONESIA:
      return 64.7;
    case IRELAND:
      return 30.4;
    case ISRAEL:
      return 61.3;
    case ITALY:
      return 22.9;
    case JAPAN:
      return 71.9;
    case JORDAN:
      return 80.9;
    case MALAYSIA:
      return 69.0;
    case MEXICO:
      return 28.5;
    case NETHERLANDS:
      return 25.0;
    case NEW_ZEALAND:
      return 12.9;
    case PANAMA:
      return 30.2;
    case PHILIPPINES:
      return 79.3;
    case POLAND:
      return 39.9;
    case PORTUGAL:
      return 27.6;
    case QATAR:
      return 119.3;
    case RUSSIA:
      return 46.1;
    case SAUDI_ARABIA:
      return 142.2;
    case SINGAPORE:
      return 37.1;
    case SOUTH_AFRICA:
      return 40.2;
    case SOUTH_KOREA:
      return 64.5;
    case SPAIN:
      return 18.7;
    case SWITZERLAND:
      return 6.9;
    case TAIWAN:
      return 71.1;
    case THAILAND:
      return 54.6;
    case TURKEY:
      return 51.8;
    case UNITED_ARAB_EMIRATES:
      return 94.9;
    case UNITED_KINGDON:
      return 17.4;
    case UK_LONDON:
      return 20.4;
    case UNITED_STATES:
      return 21.4;
    case VIETNAM:
      return 55.1;
    default:
        throw new Error(`Unknown country class: ${country}`);
  }
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
    return carbonIntensity(activity.country) * Math.ceil(activity.durationHours / 24);
  }