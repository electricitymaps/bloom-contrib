import { getEntryByKey } from '../../co2eq/purchase/index';
import { ACTIVITY_TYPE_PURCHASE, ACTIVITY_TYPE_TRANSPORTATION } from '../../definitions';


export const getActivityTypeForPurchaseCategory = (purchaseCategory) => {
    const coicopCategory = getEntryByKey(purchaseCategory);

    const activityType = coicopCategory.activityType ? coicopCategory.activityType : ACTIVITY_TYPE_PURCHASE;

    if (activityType === ACTIVITY_TYPE_TRANSPORTATION) {
        const transportationMode = coicopCategory.transportationMode;
        return { activityType, purchaseCategory, transportationMode };
    }

    return { activityType, purchaseCategory };
};
