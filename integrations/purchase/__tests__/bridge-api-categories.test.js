import { getEntryByKey } from '../../../co2eq/purchase';
import { ALL_ACTIVITY_TYPES } from '../../../definitions';
import { BRIDGE_API_CATEGORIES } from '../bridge/bridge-api-categories';

const CATEGORY_MAPPINGS = Object.entries(BRIDGE_API_CATEGORIES).filter(
  ([_key, category]) => category
);

describe('BRIDGE_API_CATEGORIES', () => {
  CATEGORY_MAPPINGS.forEach(([key, category]) => {
    it(`maps ${key} to valid category`, () => {
      const { activityType, purchaseCategory } = category;
      expect(ALL_ACTIVITY_TYPES).toContain(activityType);

      const footprintPurchaseCategory = getEntryByKey(purchaseCategory);
      expect(footprintPurchaseCategory).toBeDefined();
      expect(footprintPurchaseCategory).toHaveProperty('intensityKilograms');
    });
  });
});
