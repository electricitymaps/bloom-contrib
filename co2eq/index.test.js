import carbonModels from './index';

describe(`all models have valid API`, () => {
  carbonModels.forEach((model) => {
    test(`${model.modelName}`, () => {
      expect(model.modelName).toBeDefined();
      expect(model.modelVersion).toBeDefined();
      expect(model.explanation).toBeDefined();
      expect(model.modelCanRunVersion).toBeDefined();
      expect(model.modelCanRun).toBeDefined();
      expect(model.carbonEmissions).toBeDefined();
    });
  });
});
