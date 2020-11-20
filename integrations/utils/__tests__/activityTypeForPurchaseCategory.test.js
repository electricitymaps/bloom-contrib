import { getEntryByKey } from '../../../co2eq/purchase/index'
import { getActivityTypeForPurchaseCategory } from '../activityTypeForPurchaseCategory';
import { ACTIVITY_TYPE_MEAL, ACTIVITY_TYPE_PURCHASE, ACTIVITY_TYPE_TRANSPORTATION, TRANSPORTATION_MODE_BIKE } from '../../../definitions';

/**
 * Should test
 * 1. if no activityType for purchaseCategory -> defaults to PURCHASE
 * 2. if activityType for purchaseCategory -> uses that
 * 3. if activityType === Transport -> adds transportationMode
 */

 const PURCHASE_CATEGORY_STANDARD = 'PURCHASE_CATEGORY_STANDARD';
 const PURCHASE_CATEGORY_MEAL = 'PURCHASE_CATEGORY_MEAL';
 const PURCHASE_CATEGORY_TRANSPORTATION = 'PURCHASE_CATEGORY_TRANSPORTATION';


 const mockFootprints = {
     PURCHASE_CATEGORY_STANDARD: {
         coicopCode: '00.00.01',
         source: 'very trustworthy source',
         intensityKilograms: 1,
     },
     PURCHASE_CATEGORY_MEAL: {
        coicopCode: '00.00.02',
        source: 'very trustworthy source',
        intensityKilograms: 1,
        activityType: ACTIVITY_TYPE_MEAL,
    },
    PURCHASE_CATEGORY_TRANSPORTATION: {
        coicopCode: '00.00.03',
        source: 'very trustworthy source',
        intensityKilograms: 1,
        activityType: ACTIVITY_TYPE_TRANSPORTATION,
        transportationMode: TRANSPORTATION_MODE_BIKE,
    },
 };

 jest.mock('../../../co2eq/purchase/index');
 const getEntryByKeySpy = jest.fn((category) => mockFootprints[category]);
 getEntryByKey.mockImplementation((category) => getEntryByKeySpy(category));


 describe('assignation of an activity category to a purchase category', () => {;

    test('defaults to ACTIVITY_TYPE_PURCHASE if the purchaseCategory has no assigned activityType', () => {

        const activity = getActivityTypeForPurchaseCategory(PURCHASE_CATEGORY_STANDARD);
        expect(getEntryByKeySpy).toHaveBeenCalledTimes(1);
        expect(activity).toEqual({
            activityType: ACTIVITY_TYPE_PURCHASE,
            purchaseCategory: PURCHASE_CATEGORY_STANDARD
        });
    });

    test('uses the activityType for the purchaseCategory', () => {
        
        expect(getActivityTypeForPurchaseCategory(PURCHASE_CATEGORY_MEAL)).toEqual({
            activityType: ACTIVITY_TYPE_MEAL,
            purchaseCategory: PURCHASE_CATEGORY_MEAL
        });
    });

    test('if the activityType is ACTIVITY_TYPE_TRANSPORTATION, should specify the transportationMode', () => {

        expect(getActivityTypeForPurchaseCategory(PURCHASE_CATEGORY_TRANSPORTATION)).toEqual({
            activityType: ACTIVITY_TYPE_TRANSPORTATION,
            purchaseCategory: PURCHASE_CATEGORY_TRANSPORTATION,
            transportationMode: TRANSPORTATION_MODE_BIKE,
        });
    });

 });