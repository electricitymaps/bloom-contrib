// Declare all types
// The value should not changed as it is stored in the database
// The variable name can however be changed

/* Units */
export const UNIT_LITER = 'L';
export const UNIT_KILOGRAMS = 'kg';
export const UNIT_MONETARY_EUR = 'EUR';
export const UNIT_ITEM = 'item';

/* Activity Types */
export const ACTIVITY_TYPE_ELECTRICITY = 'ACTIVITY_TYPE_ELECTRICITY';
export const ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING = 'ACTIVITY_TYPE_ELECTRIC_VEHICLE_CHARGING';
export const ACTIVITY_TYPE_TRANSPORTATION = 'ACTIVITY_TYPE_TRANSPORTATION';
export const ACTIVITY_TYPE_MEAL = 'ACTIVITY_TYPE_MEAL';
export const ACTIVITY_TYPE_PURCHASE = 'ACTIVITY_TYPE_PURCHASE';

/* Transportation */
export const TRANSPORTATION_MODE_PLANE = 'plane';
export const TRANSPORTATION_MODE_BIKE = 'bike';
export const TRANSPORTATION_MODE_CAR = 'car';
export const TRANSPORTATION_MODE_BUS = 'bus';
export const TRANSPORTATION_MODE_PUBLIC_TRANSPORT = 'public_transport';
export const TRANSPORTATION_MODE_TRAIN = 'train';
export const TRANSPORTATION_MODE_FERRY = 'ferry';
export const TRANSPORTATION_MODE_ESCOOTER = 'escooter';
export const TRANSPORTATION_MODE_MOTORBIKE = 'motorbike';

/* Meals */
export const MEAL_TYPE_VEGAN = 'MEAL_TYPE_VEGAN';
export const MEAL_TYPE_VEGETARIAN = 'MEAL_TYPE_VEGETARIAN';
export const MEAL_TYPE_MEAT_OR_FISH = 'MEAL_TYPE_MEAT_OR_FISH';

/* Purchases */
// Food and beverages
export const PURCHASE_CATEGORY_FOOD = 'Food';
export const PURCHASE_CATEGORY_FOOD_SUPERMARKET = 'Grocery store';
export const PURCHASE_CATEGORY_FOOD_BAKERY = 'Bakery';
export const PURCHASE_CATEGORY_MOBILE_PHONE = 'Mobile phone';

// Stores
export const PURCHASE_CATEGORY_STORE_DEPARTMENT = 'Department store';
export const PURCHASE_CATEGORY_STORE_CLOTHING = 'Clothing';
export const PURCHASE_CATEGORY_STORE_HARDWARE = 'Hardware';
export const PURCHASE_CATEGORY_STORE_PET = 'Pet shop';
export const PURCHASE_CATEGORY_STORE_ELECTRONIC = 'Electronic store';
export const PURCHASE_CATEGORY_STORE_BOOKS = 'Bookshop';
export const PURCHASE_CATEGORY_STORE_GARDEN = 'Lawn and garden store';
export const PURCHASE_CATEGORY_STORE_FLORIST = 'Florist';
export const PURCHASE_CATEGORY_STORE_BARBER_BEAUTY = 'Barber or beauty shop';
export const PURCHASE_CATEGORY_STORE_HOUSE_FURNISHING = 'House furnishing';
export const PURCHASE_CATEGORY_STORE_EQUIPMENT_FURNITURE = 'Equipment furniture';
export const PURCHASE_CATEGORY_STORE_HOUSEHOLD_APPLIANCE = 'Household appliances';

// Healthcare
export const PURCHASE_CATEGORY_HEALTHCARE_PHARMARCY = 'Drug store or pharmacy';
export const PURCHASE_CATEGORY_HEALTHCARE_DOCTOR = 'Doctor';

// Transportation
export const PURCHASE_CATEGORY_TRANSPORTATION_FUEL = 'Fuel';
export const PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARKING = 'Parking lot';
export const PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_PARTS = 'Automotive parts or accessories';
export const PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_SERVICE = 'Automotive services';

// Entertainment
export const PURCHASE_CATEGORY_ENTERTAINMENT_CIGAR_STORES = 'Tobacco store';
export const PURCHASE_CATEGORY_ENTERTAINMENT_AMUSEMENT_PARKS = 'Amusement park';
export const PURCHASE_CATEGORY_ENTERTAINMENT_MOVIE_THEATER = 'Cinema';
export const PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL = 'Hotel';
export const PURCHASE_CATEGORY_ENTERTAINMENT_BAR_NIGHTCLUB = 'Bar or nightclub';
export const PURCHASE_CATEGORY_ENTERTAINMENT_GAMBLING = 'Gambling';
export const PURCHASE_CATEGORY_ENTERTAINMENT_CRUISE_LINES = 'Cruise';
export const PURCHASE_CATEGORY_ENTERTAINMENT_LIQUOR_STORE = 'Liquor store';
