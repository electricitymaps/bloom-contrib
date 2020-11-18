// Declare all types
// The value should not changed as it is stored in the database
// The variable name can however be changed

/* Units */
export const UNIT_LITER = 'L';
export const UNIT_KILOGRAMS = 'kg';
export const UNIT_MONETARY_EUR = 'EUR';
export const UNIT_ITEM = 'item';
export const UNIT_ENERGY = 'kWh';
export const UNIT_PORTION = 'portion';
export const UNIT_GLASS = 'glass';
export const UNIT_CUP = 'cup';
export const UNITS = [
  UNIT_LITER,
  UNIT_KILOGRAMS,
  UNIT_MONETARY_EUR,
  UNIT_ITEM,
  UNIT_ENERGY,
  UNIT_PORTION,
  UNIT_GLASS,
  UNIT_CUP,
];

export const UNIT_CURRENCIES = {
  ALL: 'ALL',
  ARS: 'ARS',
  AUD: 'AUD',
  BAM: 'BAM',
  BGN: 'BGN',
  BRL: 'BRL',
  CAD: 'CAD',
  CHF: 'CHF',
  CNY: 'CNY',
  CZK: 'CZK',
  DKK: 'DKK',
  EUR: 'EUR',
  GBP: 'GBP',
  HKD: 'HKD',
  HRK: 'HRK',
  HUF: 'HUF',
  IDR: 'IDR',
  ILS: 'ILS',
  INR: 'INR',
  ISK: 'ISK',
  JPY: 'JPY',
  KRW: 'KRW',
  MKD: 'MKD',
  MXN: 'MXN',
  MYR: 'MYR',
  NOK: 'NOK',
  NZD: 'NZD',
  PHP: 'PHP',
  PLN: 'PLN',
  RON: 'RON',
  RSD: 'RSD',
  RUB: 'RUB',
  SEK: 'SEK',
  SGD: 'SGD',
  THB: 'THB',
  TRY: 'TRY',
  TWD: 'TWD',
  USD: 'USD',
  ZAR: 'ZAR',
};

/* Activity Types
Each activity type is tied to a specific UI
This is why it's important to group the electricity activities together
as they will use the electricityMap.
*/
export const ACTIVITY_TYPE_ELECTRICITY = 'ACTIVITY_TYPE_ELECTRICITY';
export const ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING = 'ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING';
export const ACTIVITY_TYPE_ELECTRIC_HEATING = 'ACTIVITY_TYPE_ELECTRIC_HEATING';
export const ACTIVITY_TYPE_NON_ELECTRIC_HEATING = 'ACTIVITY_TYPE_NON_ELECTRIC_HEATING';
export const ACTIVITY_TYPE_TRANSPORTATION = 'ACTIVITY_TYPE_TRANSPORTATION';
export const ACTIVITY_TYPE_MEAL = 'ACTIVITY_TYPE_MEAL';
export const ACTIVITY_TYPE_PURCHASE = 'ACTIVITY_TYPE_PURCHASE';

export const ELECTRICITY_ACTIVITIES = [
  ACTIVITY_TYPE_ELECTRICITY,
  ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING,
  ACTIVITY_TYPE_ELECTRIC_HEATING,
];

/* Transportation */
export const TRANSPORTATION_MODE_PLANE = 'plane';
export const TRANSPORTATION_MODE_BIKE = 'bike';
export const TRANSPORTATION_MODE_EBIKE = 'ebike';
export const TRANSPORTATION_MODE_CAR = 'car';
export const TRANSPORTATION_MODE_BUS = 'bus';
export const TRANSPORTATION_MODE_PUBLIC_TRANSPORT = 'public_transport';
export const TRANSPORTATION_MODE_TRAIN = 'train';
export const TRANSPORTATION_MODE_FERRY = 'ferry';
export const TRANSPORTATION_MODE_ESCOOTER = 'escooter';
export const TRANSPORTATION_MODE_MOTORBIKE = 'motorbike';
export const TRANSPORTATION_MODE_FOOT = 'foot';

/* Meals */
export const MEAL_TYPE_VEGAN = 'MEAL_TYPE_VEGAN';
export const MEAL_TYPE_VEGETARIAN = 'MEAL_TYPE_VEGETARIAN';
export const MEAL_TYPE_MEAT_OR_FISH = 'MEAL_TYPE_MEAT_OR_FISH';
export const MEAL_TYPE_PESCETARIAN = 'MEAL_TYPE_PESCETARIAN';
export const MEAL_TYPE_MEAT_LOW = 'MEAL_TYPE_MEAT_LOW';
export const MEAL_TYPE_MEAT_MEDIUM = 'MEAL_TYPE_MEAT_MEDIUM';
export const MEAL_TYPE_MEAT_HIGH = 'MEAL_TYPE_MEAT_HIGH';

// Car
// Size (values are used in co2eq/car/cars.json)
export const EUROCARSEGMENT_A = 'A'; // corresponds to size "Mini" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENT_B = 'B'; // corresponds to size "Supermini" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENT_C = 'C'; // corresponds to size "Lower medium" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENT_D = 'D'; // corresponds to size "Upper medium" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENT_E = 'E'; // corresponds to size "Executive" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENT_F = 'F'; // corresponds to size "Luxury" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENT_S = 'S'; // corresponds to size "Sports" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENT_J = 'J'; // corresponds to size "Dual purpose 4X4" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENT_M = 'M'; // corresponds to size "MPV" in https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2019
export const EUROCARSEGMENTS = [
  EUROCARSEGMENT_A,
  EUROCARSEGMENT_B,
  EUROCARSEGMENT_C,
  EUROCARSEGMENT_D,
  EUROCARSEGMENT_E,
  EUROCARSEGMENT_F,
  EUROCARSEGMENT_S,
  EUROCARSEGMENT_J,
  EUROCARSEGMENT_M,
];

// Engine type (values are used in co2eq/car/cars.json)
export const ENGINETYPE_DIESEL = 'diesel';
export const ENGINETYPE_PETROL = 'petrol';
export const ENGINETYPE_PLUGIN_HYBRID_ELECTRIC = 'plugInHybridElectric';
export const ENGINETYPE_BATTERY_ELECTRIC = 'batteryElectric';
export const ENGINETYPE_HYBRID = 'hybrid';
export const ENGINETYPE_LPG = 'lpg';
export const ENGINETYPE_CNG = 'cng';
export const ENGINETYPES = [
  ENGINETYPE_DIESEL,
  ENGINETYPE_PETROL,
  ENGINETYPE_PLUGIN_HYBRID_ELECTRIC,
  ENGINETYPE_BATTERY_ELECTRIC,
  ENGINETYPE_HYBRID,
  ENGINETYPE_LPG,
  ENGINETYPE_CNG,
];

// Heating source
export const HEATING_SOURCE_COAL_BOILER = 'HEATING_SOURCE_COAL_BOILER';
export const HEATING_SOURCE_OIL_BOILER = 'HEATING_SOURCE_OIL_BOILER';
export const HEATING_SOURCE_GAS_BOILER = 'HEATING_SOURCE_GAS_BOILER';
export const HEATING_SOURCE_GAS_MICRO_COMBINED_HEAT_AND_POWER =
  'HEATING_SOURCE_GAS_MICRO_COMBINED_HEAT_AND_POWER';
export const HEATING_SOURCE_GAS_ABSORPTION_HEAT_PUMP = 'HEATING_SOURCE_GAS_ABSORPTION_HEAT_PUMP';
export const HEATING_SOURCE_BIOSOURCED_GASES = 'HEATING_SOURCE_BIOSOURCED_GASES';
export const HEATING_SOURCE_BIOMASS_BOILER = 'HEATING_SOURCE_BIOMASS_BOILER';
export const HEATING_SOURCE_GEOTHERMAL = 'HEATING_SOURCE_GEOTHERMAL';
export const HEATING_SOURCE_SOLAR_THERMAL = 'HEATING_SOURCE_SOLAR_THERMAL';
export const HEATING_SOURCE_DISTRICT_HEATING = 'HEATING_SOURCE_DISTRICT_HEATING';

// Hotel  stay
export const HOTEL_CLASS_ZERO_TO_TWO_STARS = 'HOTEL_CLASS_ZERO_TO_TWO_STARS';
export const HOTEL_CLASS_THREE_STARS = 'HOTEL_CLASS_THREE_STARS';
export const HOTEL_CLASS_FOUR_STARS = 'HOTEL_CLASS_FOUR_STARS';
export const HOTEL_CLASS_FIVE_STARS = 'HOTEL_CLASS_FIVE_STARS';

/* Purchases */
// Food and beverages
export const PURCHASE_CATEGORY_FOOD = 'Food';
export const PURCHASE_CATEGORY_FOOD_BAKERY = 'Cereals and cereal products (ND)';
export const PURCHASE_CATEGORY_ALCOHOL = 'ALCOHOLIC BEVERAGES';
export const PURCHASE_CATEGORY_READY_FOOD = 'Ready-made food and other food products n.e.c. (ND)';
export const PURCHASE_CATEGORY_FOOD_SERVING_SERVICES = 'FOOD AND BEVERAGE SERVING SERVICES';

// Stores
export const PURCHASE_CATEGORY_STORE_CLOTHING = 'CLOTHING';
export const PURCHASE_CATEGORY_STORE_FOOD = 'FOOD AND NON-ALCOHOLIC BEVERAGES';
export const PURCHASE_CATEGORY_STORE_HARDWARE = 'TOOLS AND EQUIPMENT FOR HOUSE AND GARDEN';
export const PURCHASE_CATEGORY_STORE_GARDEN_AND_PET = 'GARDEN PRODUCTS AND PETS';
export const PURCHASE_CATEGORY_STORE_ELECTRONIC = 'Information and communication equipment';
export const PURCHASE_CATEGORY_STORE_BOOKS = 'NEWSPAPERS, BOOKS AND STATIONERY';
export const PURCHASE_CATEGORY_STORE_PERSONAL_CARE = 'PERSONAL CARE';
export const PURCHASE_CATEGORY_STORE_FURNISHING = 'Furnishings, loose carpets and rugs (D)';
export const PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE = 'HOUSEHOLD APPLIANCES';

// Healthcare
export const PURCHASE_CATEGORY_MEDICINES_AND_HEALTH_PRODUCTS = 'MEDICINES AND HEALTH PRODUCTS';
export const PURCHASE_CATEGORY_HEALTHCARE_DOCTOR = 'OUTPATIENT CARE SERVICES';

// Transportation
export const PURCHASE_CATEGORY_TRANSPORTATION_FUEL =
  'Fuels and lubricants for personal transport equipment (ND)';
export const PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_MAINTENANCE_AND_REPAIR =
  'Maintenance and repair of personal transport equipment (S)';
export const PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS =
  'Parts and accessories for personal transport equipment (SD)';
export const PURCHASE_CATEGORY_OTHER_TRANSPORT_SERVICES = 'Other purchased transport services (S)';
export const PURCHASE_CATEGORY_TRANSPORT_ROAD = 'Passenger transport by road (S)';
export const PURCHASE_CATEGORY_TRANSPORT_AIR = 'Passenger transport by air (S)';
export const PURCHASE_CATEGORY_TRANSPORT_RAIL = 'Passenger transport by railway (S)';
export const PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT = 'Combined passenger transport (S)';
export const PURCHASE_CATEGORY_MISC_SERVICES_PERSONAL_TRANSPORT =
  'Other services in respect of personal transport equipment (S)';

// Entertainment
export const PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL = 'ACCOMMODATION SERVICES';
export const PURCHASE_CATEGORY_RECREATIONAL_SERVICES = 'RECREATIONAL SERVICES';
export const PURCHASE_CATEGORY_RECREATIONAL_DURABLES = 'RECREATIONAL DURABLES';
export const PURCHASE_CATEGORY_PACKAGE_HOLIDAYS = 'PACKAGE HOLIDAYS';

// Finances
export const PURCHASE_CATEGORY_FINANCIAL_SERVICES = 'FINANCIAL SERVICES';
export const PURCHASE_CATEGORY_INSURANCE = 'INSURANCE';

// Household - Housing
export const PURCHASE_CATEGORY_HOUSING = 'HOUSING, WATER, ELECTRICITY, GAS AND OTHER FUELS';
export const PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS = 'Non-durable household goods (ND)';
export const PURCHASE_CATEGORY_OTHER_ENERGY_HEATING_COOLING =
  'Other energy for heating and cooling (ND)';
export const PURCHASE_CATEGORY_MAINTENANCE_DWELLING =
  'MAINTENANCE, REPAIR AND SECURITY OF THE DWELLING';
export const PURCHASE_CATEGORY_HOUSEHOLD_MAINTENANCE =
  'GOODS AND SERVICES FOR ROUTINE HOUSEHOLD MAINTENANCE';
export const PURCHASE_CATEGORY_MISC_DWELLING =
  'WATER SUPPLY AND MISCELLANEOUS SERVICES RELATING TO THE DWELLING';
export const PURCHASE_CATEGORY_RENTAL = 'ACTUAL RENTALS FOR HOUSING';
export const PURCHASE_CATEGORY_GAS = 'Gas (ND)';
export const PURCHASE_CATEGORY_ELECTRICITY = 'Electricity (ND)';

// Purchase MISC
export const PURCHASE_CATEGORY_OTHER_SERVICES = 'OTHER SERVICES';
export const PURCHASE_CATEGORY_SOCIAL_PROTECTION = 'SOCIAL PROTECTION';
export const PURCHASE_CATEGORY_OTHER_PERSONAL_EFFECTS = 'OTHER PERSONAL EFFECTS';
export const PURCHASE_CATEGORY_INFORMATION_COMMUNICATION = 'INFORMATION AND COMMUNICATION';
export const PURCHASE_CATEGORY_MOBILE_PHONE = 'Mobile phone';
