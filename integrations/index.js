import digitalContribSources from './digital';
import electricityContribSources from './electricity';
import transportationContribSources from './transportation';

export default {
  ...digitalContribSources,
  ...electricityContribSources,
  ...transportationContribSources,
};
