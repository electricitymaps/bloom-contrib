import digitalContribSources from './digital';
import electricityContribSources from './electricity';
import purchaseContribSources from './purchase';
import transportationContribSources from './transportation';

export default {
  ...digitalContribSources,
  ...electricityContribSources,
  ...purchaseContribSources,
  ...transportationContribSources,
};
