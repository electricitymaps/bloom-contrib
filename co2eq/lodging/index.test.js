import {
  modelCanRun,
  carbonEmissions,
  modelName,
  modelVersion,
  explanation,
  modelCanRunVersion,
} from './index';

test(`model has valid API`, () => {
  expect(modelName).toBeDefined();
  expect(modelVersion).toBeDefined();
  expect(explanation).toBeDefined();
  expect(modelCanRunVersion).toBeDefined();
  expect(modelCanRun).toBeDefined();
  expect(carbonEmissions).toBeDefined();
});
