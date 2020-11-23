import { getEntryByKey, ENTRY_BY_KEY } from '../../co2eq/purchase/index';
import { ACTIVITY_TYPE_PURCHASE, ACTIVITY_TYPE_TRANSPORTATION } from '../../definitions';


export const getActivityTypeForPurchaseCategory = (purchaseCategory) => {
    const coicopCategory = getEntryByKey(purchaseCategory);

    if (!coicopCategory) {
        throw new Error(`Error matching a purchaseCategory to its COICOP equivalent: The purchaseCategory ${purchaseCategory} is not recognized.`);
        console.log(purchaseCategory);
        console.log(ENTRY_BY_KEY);
    }

    const activityType = coicopCategory.activityType ? coicopCategory.activityType : ACTIVITY_TYPE_PURCHASE;

    if (activityType === ACTIVITY_TYPE_TRANSPORTATION) {
        const transportationMode = coicopCategory.transportationMode;
        return { activityType, purchaseCategory, transportationMode };
    }

    return { activityType, purchaseCategory };
};
