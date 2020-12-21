import { getEntryByKey } from '../../../co2eq/purchase';
import { ALL_ACTIVITY_TYPES } from '../../../definitions';
import { NAG_CATEGORY } from '../nordic-api-gateway/nag-categories';

const CATEGORY_MAPPINGS = Object.entries(NAG_CATEGORY).filter(([_key, category]) => category);

describe('NAG_CATEGORY', () => {
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
