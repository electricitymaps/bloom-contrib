import { featuresContaining } from '@ideditor/country-coder';
import { lookup } from 'reverse-geocode';
import { ELECTRICITY_ACTIVITIES } from '../../definitions';
import { factors } from './emissionfactors.json';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'electricity-world-average';
export const modelVersion = '1';
export const explanation = {
  text:
    'Calculations take into account the direct emissions associated with the generation of electricity worldwide.',
  links: [
    {
      label: 'IEA (2019)',
      href: 'https://www.iea.org/reports/global-energy-co2-status-report-2019/emissions',
    },
    {
      label: 'Carbon footprint',
      href:
        'https://www.carbonfootprint.com/docs/2019_06_emissions_factors_sources_for_2019_electricity.pdf',
    },
  ],
};

const worldCarbonIntensity = 475; // g/kWh

export const modelCanRunVersion = 2;
export function modelCanRun(activity) {
  const { energyWattHours, activityType } = activity;
  const isElectricActivity = ELECTRICITY_ACTIVITIES.includes(activityType);
  return isElectricActivity && energyWattHours;
}

function correctWithParticipants(footprint, participants) {
  return footprint / (participants || 1);
}
const countriesWithStateData = ['CA', 'US', 'AU'];
function getCarbonFactor(locationLat, locationLon) {
  const features = featuresContaining([locationLon, locationLat]); // order of parameters for this lib goes against conventions
  if (!features || features.length === 0) {
    return undefined;
  }
  const countries = features.filter((x) => x.properties.level === 'country');
  if (countries.length === 0) {
    return undefined;
  }
  const country = countries[0];
  const potentialFactors = factors.filter((x) => x.country === country.properties.iso1A3);
  if (potentialFactors.length === 1) {
    return potentialFactors[0].factor;
  }
  if (
    potentialFactors.length > 1 &&
    countriesWithStateData.indexOf(country.properties.iso1A2) !== -1
  ) {
    const reverseInformation = lookup(locationLat, locationLon, country.properties.iso1A2);
    if (reverseInformation && reverseInformation.state_abbr) {
      const stateCode = reverseInformation.state_abbr.toUpperCase();
      const potentialStateFactors = potentialFactors.filter((x) => x.state === stateCode);
      return potentialStateFactors.length === 0
        ? potentialFactors[0].factor
        : potentialStateFactors[0].factor;
    }
    return potentialFactors[0].factor;
  }
  return undefined;
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
function carbonEmissionsWithoutParticipants(activity) {
  let carbonFactor = worldCarbonIntensity;
  if (activity.locationLon && activity.locationLat) {
    const preciseFactor = getCarbonFactor(activity.locationLat, activity.locationLon);
    if (preciseFactor) {
      carbonFactor = preciseFactor;
    }
  }
  return ((activity.energyWattHours / 1000.0) * carbonFactor) / 1000.0;
}

export function carbonEmissions(activity) {
  return correctWithParticipants(
    carbonEmissionsWithoutParticipants(activity),
    activity.participants
  );
}
