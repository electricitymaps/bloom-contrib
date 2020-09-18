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
  PURCHASE_CATEGORY_SOCIAL_PROTECTION,
  PURCHASE_CATEGORY_INSURANCE,
  PURCHASE_CATEGORY_RECREATIONAL_SERVICES,
  PURCHASE_CATEGORY_INFORMATION_COMMUNICATION,
  PURCHASE_CATEGORY_FOOD_SERVING_SERVICES,
  PURCHASE_CATEGORY_TRANSPORT_AIR,
  PURCHASE_CATEGORY_TRANSPORT_RAIL,
  PURCHASE_CATEGORY_TRANSPORT_ROAD,
  PURCHASE_CATEGORY_RECREATIONAL_DURABLES,
  PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS,
  PURCHASE_CATEGORY_MISC_DWELLING,
  PURCHASE_CATEGORY_READY_FOOD,
  PURCHASE_CATEGORY_RENTAL,
  PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT,
  PURCHASE_CATEGORY_MISC_SERVICES_PERSONAL_TRANSPORT,
  PURCHASE_CATEGORY_HOUSING,
  PURCHASE_CATEGORY_ELECTRICITY,
  PURCHASE_CATEGORY_GAS,
  PURCHASE_CATEGORY_HOUSEHOLD_MAINTENANCE,
  PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL,
  PURCHASE_CATEGORY_ENTERTAINMENT_CIGAR_STORES,
  PURCHASE_CATEGORY_PACKAGE_HOLIDAYS,
} from '../../definitions';

const purchaseActivity = purchaseType =>
  purchaseType
    ? {
        purchaseType,
        activityType: ACTIVITY_TYPE_PURCHASE,
      }
    : null;

export const BRIDGE_API_CATEGORIES = {
  303: purchaseActivity(), // - Withdrawals, checks & transfer
  326: purchaseActivity(), // Internal transfer
  88: purchaseActivity(), // Checks
  85: purchaseActivity(), // Withdrawals
  78: purchaseActivity(), // Transfer

  159: purchaseActivity(), // - Taxes
  302: purchaseActivity(), // Taxes
  209: purchaseActivity(), // Property taxes
  208: purchaseActivity(), // Income taxes
  207: purchaseActivity(), // Taxes
  206: purchaseActivity(), // Taxes - Others

  165: purchaseActivity(PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT), // - Auto & Transport
  309: purchaseActivity(PURCHASE_CATEGORY_MISC_SERVICES_PERSONAL_TRANSPORT), // Tolls
  288: purchaseActivity(PURCHASE_CATEGORY_TRANSPORTATION_AUTOMOTIVE_MAINTENANCE_AND_REPAIR), // Car maintenance
  264: purchaseActivity(PURCHASE_CATEGORY_TRANSPORT_ROAD), // Car rental
  251: purchaseActivity(PURCHASE_CATEGORY_MISC_SERVICES_PERSONAL_TRANSPORT), // Parking
  247: purchaseActivity(PURCHASE_CATEGORY_INSURANCE), // Auto insurance
  198: purchaseActivity(PURCHASE_CATEGORY_TRANSPORT_AIR), // Plane ticket
  197: purchaseActivity(PURCHASE_CATEGORY_TRANSPORT_RAIL), // Train ticket
  196: purchaseActivity(PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT), // Public transportation
  87: purchaseActivity(PURCHASE_CATEGORY_TRANSPORTATION_FUEL), // Gas & Fuel
  84: purchaseActivity(PURCHASE_CATEGORY_COMBINED_PASSENGER_TRANSPORT), // Auto & Transport - Others

  162: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // - Shopping
  441888: purchaseActivity(), // Licences
  319: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // Movies
  318: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_DURABLES), // Music
  272: purchaseActivity(PURCHASE_CATEGORY_STORE_CLOTHING), // Clothing & Shoes
  262: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_DURABLES), // Sporting goods
  243: purchaseActivity(PURCHASE_CATEGORY_STORE_BOOKS), // Books
  186: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_DURABLES), // Shopping - Others
  184: purchaseActivity(PURCHASE_CATEGORY_STORE_HARDWARE), // Hardware
  183: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_DURABLES), // Gifts

  171: purchaseActivity(PURCHASE_CATEGORY_INFORMATION_COMMUNICATION), // - Bills & Utilities
  280: purchaseActivity(PURCHASE_CATEGORY_INFORMATION_COMMUNICATION), // Subscription - Others
  277: purchaseActivity(PURCHASE_CATEGORY_INFORMATION_COMMUNICATION), // Mobile phone
  258: purchaseActivity(PURCHASE_CATEGORY_INFORMATION_COMMUNICATION), // Home phone
  219: purchaseActivity(PURCHASE_CATEGORY_INFORMATION_COMMUNICATION), // Cable TV
  180: purchaseActivity(PURCHASE_CATEGORY_INFORMATION_COMMUNICATION), // Internet

  315: purchaseActivity(PURCHASE_CATEGORY_STORE_PERSONAL_CARE), // - Personal care
  321: purchaseActivity(PURCHASE_CATEGORY_STORE_PERSONAL_CARE), // Beauty care
  317: purchaseActivity(PURCHASE_CATEGORY_STORE_PERSONAL_CARE), // Personal care - Others
  316: purchaseActivity(PURCHASE_CATEGORY_STORE_PERSONAL_CARE), // Spa & Massage
  248: purchaseActivity(PURCHASE_CATEGORY_STORE_PERSONAL_CARE), // Cosmetics
  235: purchaseActivity(PURCHASE_CATEGORY_STORE_PERSONAL_CARE), // Hairdresser

  161: purchaseActivity(PURCHASE_CATEGORY_HOUSING), // - Home
  328: purchaseActivity(PURCHASE_CATEGORY_MISC_DWELLING), // Misc. utilities
  323: purchaseActivity(PURCHASE_CATEGORY_STORE_GARDEN_AND_PET), // Lawn & Garden
  293: purchaseActivity(PURCHASE_CATEGORY_MISC_DWELLING), // Water
  246: purchaseActivity(), // Home insurance
  222: purchaseActivity(PURCHASE_CATEGORY_HOUSEHOLD_MAINTENANCE), // Maintenance
  218: purchaseActivity(PURCHASE_CATEGORY_GAS), // Gas
  217: purchaseActivity(PURCHASE_CATEGORY_ELECTRICITY), // Electricity

  166: purchaseActivity(), // - Business services
  221: purchaseActivity(PURCHASE_CATEGORY_STORE_FURNISHING), // Office improvement
  220: purchaseActivity(PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS), // Offices - Others
  216: purchaseActivity(PURCHASE_CATEGORY_RENTAL), // Office Rent
  441900: purchaseActivity(), // Marketing
  441899: purchaseActivity(), // Legal Fees
  441898: purchaseActivity(), // Training taxes
  441897: purchaseActivity(), // Disability Insurance
  441896: purchaseActivity(), // Outsourcing
  441895: purchaseActivity(), // Consulting
  441892: purchaseActivity(), // Hiring fees
  441891: purchaseActivity(), // Salary of executives
  441890: purchaseActivity(), // Salaries
  441889: purchaseActivity(), // Accounting
  441886: purchaseActivity(), // Employer contributions
  274: purchaseActivity(PURCHASE_CATEGORY_NON_DURABLE_HOUSEHOLD_GOODS), // Office supplies
  270: purchaseActivity(PURCHASE_CATEGORY_INFORMATION_COMMUNICATION), // Online services
  265: purchaseActivity(), // Business expenses
  205: purchaseActivity(), // Printing
  204: purchaseActivity(), // Shipping
  203: purchaseActivity(), // Office services
  202: purchaseActivity(), // Advertising
  90: purchaseActivity(), // General expenses - Others

  164: purchaseActivity(), // - Bank
  756587: purchaseActivity(), // Payment incidents
  306: purchaseActivity(PURCHASE_CATEGORY_FINANCIAL_SERVICES), // Banking services
  195: purchaseActivity(), // Bank - Others
  194: purchaseActivity(), // Mortgage
  192: purchaseActivity(), // Savings
  191: purchaseActivity(), // Monthly Debit
  89: purchaseActivity(), // Mortgage refund
  79: purchaseActivity(PURCHASE_CATEGORY_FINANCIAL_SERVICES), // Banking fees and charges

  163: purchaseActivity(PURCHASE_CATEGORY_MEDICINES_AND_HEALTH_PRODUCTS), // - Health
  325: purchaseActivity(PURCHASE_CATEGORY_HEALTHCARE_DOCTOR), // Dentist
  322: purchaseActivity(PURCHASE_CATEGORY_HEALTHCARE_DOCTOR), // Optician / Eyecare
  268: purchaseActivity(PURCHASE_CATEGORY_HEALTHCARE_DOCTOR), // Health - Others
  261: purchaseActivity(PURCHASE_CATEGORY_HEALTHCARE_DOCTOR), // Doctor
  245: purchaseActivity(), // Health insurance
  236: purchaseActivity(PURCHASE_CATEGORY_MEDICINES_AND_HEALTH_PRODUCTS), // Pharmacy

  167: purchaseActivity(), // - Education & Children
  267: purchaseActivity(PURCHASE_CATEGORY_SOCIAL_PROTECTION), // Baby-sitter & Daycare
  266: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_DURABLES), // Toys
  259: purchaseActivity(), // Student loan
  241: purchaseActivity(PURCHASE_CATEGORY_RENTAL), // Student housing
  240: purchaseActivity(), // Pension
  239: purchaseActivity(), // Tuition
  238: purchaseActivity(PURCHASE_CATEGORY_STORE_BOOKS), // School supplies
  237: purchaseActivity(), // Education & Children - Others

  168: purchaseActivity(PURCHASE_CATEGORY_STORE_FOOD), // - Food & Dining
  313: purchaseActivity(PURCHASE_CATEGORY_FOOD_SERVING_SERVICES), // Coffee shop
  273: purchaseActivity(PURCHASE_CATEGORY_STORE_FOOD), // Supermarkets / Groceries
  260: purchaseActivity(PURCHASE_CATEGORY_READY_FOOD), // Fast foods
  188: purchaseActivity(PURCHASE_CATEGORY_STORE_FOOD), // Food - Others
  83: purchaseActivity(PURCHASE_CATEGORY_FOOD_SERVING_SERVICES), // Restaurants

  160: purchaseActivity(), // - Misc. expenses
  324: purchaseActivity(), // Laundry / Dry cleaning
  308: purchaseActivity(PURCHASE_CATEGORY_ENTERTAINMENT_CIGAR_STORES), // Tobacco
  294: purchaseActivity(), // Charity
  278: purchaseActivity(), // Insurance
  276: purchaseActivity(), // Others spending
  1: purchaseActivity(), // Uncategorized

  170: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // - Entertainment
  320: purchaseActivity(PURCHASE_CATEGORY_FOOD_SERVING_SERVICES), // Eating out
  310: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // Winter sports
  269: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // Amusements
  263: purchaseActivity(PURCHASE_CATEGORY_ENTERTAINMENT_HOTEL), // Hotels
  249: purchaseActivity(PURCHASE_CATEGORY_PACKAGE_HOLIDAYS), // Travels / Vacation
  244: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // Arts & Amusement
  242: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // Sports
  227: purchaseActivity(PURCHASE_CATEGORY_FOOD_SERVING_SERVICES), // Bars & Clubs
  226: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // Hobbies
  224: purchaseActivity(PURCHASE_CATEGORY_STORE_GARDEN_AND_PET), // Pets
  223: purchaseActivity(PURCHASE_CATEGORY_RECREATIONAL_SERVICES), // Entertainment - Others

  2: purchaseActivity(), // - Incomes
  441894: purchaseActivity(), // Loans
  441893: purchaseActivity(), // Grants
  327: purchaseActivity(), // Pension
  314: purchaseActivity(PURCHASE_CATEGORY_RENTAL), // Rent
  289: purchaseActivity(), // Savings
  283: purchaseActivity(), // Business refunds
  282: purchaseActivity(), // Internal transfer
  279: purchaseActivity(), // Retirement
  271: purchaseActivity(), // Deposit
  233: purchaseActivity(), // Extra incomes
  232: purchaseActivity(PURCHASE_CATEGORY_FINANCIAL_SERVICES), // Services
  231: purchaseActivity(), // Sales
  230: purchaseActivity(), // Salaries
  80: purchaseActivity(), // Interest incomes
  3: purchaseActivity(), // Other incomes
};
