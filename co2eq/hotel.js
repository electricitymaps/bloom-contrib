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
The carbon intensity is per night stayed
*/
function carbonIntensity(country){
    //TODO
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
    return carbonIntensity(activity.country) * Math.ceil(activity.durationHours / 24);
  }