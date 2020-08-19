import {
  ACTIVITY_TYPE_PURCHASE,
  PURCHASE_CATEGORY_TRANSPORTATION_FUEL,
  PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_MAINTENANCE_AND_REPAIR,
  PURCHASE_CATEGORY_STORE_BOOKS,
  PURCHASE_CATEGORY_STORE_CLOTHING,
  PURCHASE_CATEGORY_STORE_FOOD,
  PURCHASE_CATEGORY_HEALTHCARE_DOCTOR,
  PURCHASE_CATEGORY_MEDICINES_AND_HEALTH_PRODUCTS,
  PURCHASE_CATEGORY_STORE_GARDEN_AND_PET,
  PURCHASE_CATEGORY_STORE_FURNISHING,
  PURCHASE_CATEGORY_STORE_PERSONAL_CARE,
  PURCHASE_CATEGORY_STORE_HARDWARE,
  PURCHASE_CATEGORY_FINANCIAL_SERVICES,
  PURCHASE_CATEGORY_OTHER_SERVICES,
  PURCHASE_CATEGORY_SOCIAL_PROTECTION,
  PURCHASE_CATEGORY_OTHER_TRANSPORT_SERVICES,
  PURCHASE_CATEGORY_INSURANCE,
  PURCHASE_CATEGORY_OTHER_PERSONAL_EFFECTS,
  PURCHASE_CATEGORY_FOOD,
  PURCHASE_CATEGORY_RECREATIONAL_SERVICES,
  PURCHASE_CATEGORY_INFORMATION_COMMUNICATION,
  PURCHASE_CATEGORY_FOOD_SERVING_SERVICES,
  PURCHASE_CATEGORY_TRANSPORT_AIR,
  PURCHASE_CATEGORY_RECREATIONAL_DURABLES,
  PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS,
  PURCHASE_CATEGORY_MAINTENANCE_DWELLING,
  PURCHASE_CATEGORY_MISC_DWELLING,
  PURCHASE_CATEGORY_READY_FOOD,
  PURCHASE_CATEGORY_RENTAL,
  PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT,
  PURCHASE_CATEGORY_MISC_SERVICES_PERSONAL_TRANSPORT,
  PURCHASE_CATEGORY_TRANSPORT_ROAD,
  PURCHASE_CATEGORY_ALCOHOL,
  PURCHASE_CATEGORY_OTHER_ENERGY_HEATING_COOLING,
  ACTIVITY_TYPE_TRANSPORTATION,
  TRANSPORTATION_MODE_CAR,
} from '../../definitions';

export const NAG_CATEGORY = {
  'ATM & Checks': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Advisors & Services': {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Alimony & Child Support': {
    purchaseType: PURCHASE_CATEGORY_SOCIAL_PROTECTION,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Auto & Transport': {
    purchaseType: PURCHASE_CATEGORY_OTHER_TRANSPORT_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Auto Insurance & Assistance': {
    purchaseType: PURCHASE_CATEGORY_INSURANCE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Auto Loan etc.': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Baby: {
    purchaseType: PURCHASE_CATEGORY_OTHER_PERSONAL_EFFECTS,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Bank Fees': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Basic Expenses': {
    purchaseType: PURCHASE_CATEGORY_FOOD,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Betting: {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Building Insurance': {
    purchaseType: PURCHASE_CATEGORY_INSURANCE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Car Rental': {
    transportationMode: TRANSPORTATION_MODE_CAR,
    activityType: ACTIVITY_TYPE_TRANSPORTATION,
  },
  'Child Benefits': {
    purchaseType: PURCHASE_CATEGORY_SOCIAL_PROTECTION,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Child Care & Tuition': null,
  'Child Savings': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Cinema, Concerts & Entertainment': {
    purchaseType: PURCHASE_CATEGORY_RECREATIONAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Clothing & Accessories': {
    purchaseType: PURCHASE_CATEGORY_STORE_CLOTHING,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Consumer Loan': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Contents Insurance': {
    purchaseType: PURCHASE_CATEGORY_INSURANCE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Debt & Interest': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Education: null,
  'Electronics & Computer': {
    purchaseType: PURCHASE_CATEGORY_INFORMATION_COMMUNICATION,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Exclude: null,
  'Fast Food & Takeaway': {
    purchaseType: PURCHASE_CATEGORY_FOOD_SERVING_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Fines: {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Flights & Hotels': {
    purchaseType: PURCHASE_CATEGORY_TRANSPORT_AIR,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Food & Drinks': {
    purchaseType: PURCHASE_CATEGORY_STORE_FOOD,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Fuel: {
    purchaseType: PURCHASE_CATEGORY_TRANSPORTATION_FUEL,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Furniture & Interior': {
    purchaseType: PURCHASE_CATEGORY_STORE_FURNISHING,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Games & Toys': {
    purchaseType: PURCHASE_CATEGORY_RECREATIONAL_DURABLES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Garage & Auto Parts': {
    purchaseType: PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_MAINTENANCE_AND_REPAIR,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Garden & Plants': {
    purchaseType: PURCHASE_CATEGORY_STORE_GARDEN_AND_PET,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Gifts & Charity': null,
  'Glasses & Contacts': {
    purchaseType: PURCHASE_CATEGORY_MEDICINES_AND_HEALTH_PRODUCTS,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Hairdresser & Personal Care': {
    purchaseType: PURCHASE_CATEGORY_STORE_PERSONAL_CARE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Health Insurance': {
    purchaseType: PURCHASE_CATEGORY_INSURANCE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Hide: null,
  'Hobby & Sports Equipment': {
    purchaseType: PURCHASE_CATEGORY_RECREATIONAL_DURABLES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Holiday Pay': null,
  Home: {
    purchaseType: PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Home Security': {
    purchaseType: PURCHASE_CATEGORY_MAINTENANCE_DWELLING,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Homeowners Association': {
    purchaseType: PURCHASE_CATEGORY_MISC_DWELLING,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Household: {
    purchaseType: PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Housekeeping & Gardening': {
    purchaseType: PURCHASE_CATEGORY_STORE_HARDWARE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Housing Benefit': {
    purchaseType: PURCHASE_CATEGORY_SOCIAL_PROTECTION,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Income: null,
  Interest: {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Interest Income': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Late Fees': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Leisure: {
    purchaseType: PURCHASE_CATEGORY_RECREATIONAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Life & Accident Insurance': {
    purchaseType: PURCHASE_CATEGORY_INSURANCE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Meal Plan': {
    purchaseType: PURCHASE_CATEGORY_STORE_FOOD,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Medical Specialists': {
    purchaseType: PURCHASE_CATEGORY_HEALTHCARE_DOCTOR,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Memberships: {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Mini-markets & Delicacies': {
    purchaseType: PURCHASE_CATEGORY_READY_FOOD,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Mortgage/Rent': {
    purchaseType: PURCHASE_CATEGORY_RENTAL,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Movies, Music & Books': {
    purchaseType: PURCHASE_CATEGORY_STORE_BOOKS,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Online Services & Software': {
    purchaseType: PURCHASE_CATEGORY_INFORMATION_COMMUNICATION,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Other: null,
  'Other Housing Expenses': {
    purchaseType: PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Other Income': null,
  'Other Private Consumption': null,
  'Other Savings': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Other Transport': {
    purchaseType: PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Overpaid Tax': null,
  Parking: {
    purchaseType: PURCHASE_CATEGORY_MISC_SERVICES_PERSONAL_TRANSPORT,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Pension & Savings': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Pension Payout': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Pension Savings': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Pets: {
    purchaseType: PURCHASE_CATEGORY_STORE_GARDEN_AND_PET,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Pharmacy: {
    purchaseType: PURCHASE_CATEGORY_MEDICINES_AND_HEALTH_PRODUCTS,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Phone & Internet': {
    purchaseType: PURCHASE_CATEGORY_INFORMATION_COMMUNICATION,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Private Loan (Friends & Family)': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Property Tax': {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Public Transport': {
    purchaseType: PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Public fee': {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Remodeling & Repair': {
    purchaseType: PURCHASE_CATEGORY_STORE_HARDWARE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Road Tax & Green Tax': {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Salary: null,
  'Shared Expense': null,
  'Sports & Leisure': {
    purchaseType: PURCHASE_CATEGORY_RECREATIONAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Stock Trading': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Student Grant': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Student Loan': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Supermarket: {
    purchaseType: PURCHASE_CATEGORY_STORE_FOOD,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'TV license & Cable': {
    purchaseType: PURCHASE_CATEGORY_INFORMATION_COMMUNICATION,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Taxi: {
    purchaseType: PURCHASE_CATEGORY_TRANSPORT_ROAD,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Tobacco & Alcohol': {
    purchaseType: PURCHASE_CATEGORY_ALCOHOL,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Transfer: {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Travel: {
    purchaseType: PURCHASE_CATEGORY_OTHER_TRANSPORT_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Travel Insurance': {
    purchaseType: PURCHASE_CATEGORY_INSURANCE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Tuition: {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Unemployment Benefits': {
    purchaseType: PURCHASE_CATEGORY_SOCIAL_PROTECTION,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Union & Unemployment Insurance': {
    purchaseType: PURCHASE_CATEGORY_INSURANCE,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Unknown: null,
  'Unpayed Tax': {
    purchaseType: PURCHASE_CATEGORY_OTHER_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  Utilities: {
    purchaseType: PURCHASE_CATEGORY_OTHER_ENERGY_HEATING_COOLING,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Vacation Activities': {
    purchaseType: PURCHASE_CATEGORY_RECREATIONAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Vacation Home & Camping': {
    purchaseType: PURCHASE_CATEGORY_RECREATIONAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Vacation Home Expenses': {
    purchaseType: PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
  'Yield & Returns': {
    purchaseType: PURCHASE_CATEGORY_FINANCIAL_SERVICES,
    activityType: ACTIVITY_TYPE_PURCHASE,
  },
};
