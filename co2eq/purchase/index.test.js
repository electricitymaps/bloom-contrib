import { UNITS } from '../../definitions';
import { getDescendants, getRootEntry } from './index';


Object.entries(getDescendants(getRootEntry()))
  .filter(([k, v]) => v.unit)
  .forEach(([k, v]) => {
    test(`default unit of ${k}`, () => {
      expect(UNITS).toContain(v.unit);
    });
  });

Object.entries(getDescendants(getRootEntry()))
  .filter(([k, v]) => v.conversions)
  .forEach(([entryKey, v]) => {
    Object.keys(v.conversions)
      .forEach((k) => {
        test(`conversion units of ${entryKey}`, () => {
          expect(UNITS).toContain(k);
        });
      });
  });
