import md5 from 'tiny-hashes/md5';

import {
  HEATING_SOURCE_COAL_BOILER,
  HEATING_SOURCE_OIL_BOILER,
  HEATING_SOURCE_GAS_BOILER,
  HEATING_SOURCE_GAS_MICRO_COMBINED_HEAT_AND_POWER,
  HEATING_SOURCE_GAS_ABSORPTION_HEAT_PUMP,
  HEATING_SOURCE_BIOSOURCED_GASES,
  HEATING_SOURCE_BIOMASS_BOILER,
  HEATING_SOURCE_GEOTHERMAL,
  HEATING_SOURCE_SOLAR_THERMAL,
  HEATING_SOURCE_ELECTRIC_HEATER,
  HEATING_SOURCE_GROUND_SOURCE_HEAT_PUMP,
  HEATING_SOURCE_AIR_SOURCE_HEAT_PUMP,
  HEATING_SOURCE_DISTRICT_HEATING,
} from '../../definitions';
import energyFootprints from './energyfootprints.yml';
import energyPrices from './energyprices.yml';
import energyUsage from './energyusage.yml';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'energy';
const ymlChecksum = md5([].map(JSON.stringify).reduce((a, b) => a + b, ''));
export const modelVersion = `1_${ymlChecksum}`; // This model relies on footprints.yaml
export const explanation = {
  text: 'TODO: @martincollignon',
  links: [],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { heatingSource } = activity;
  return heatingSource != null;
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
export function carbonEmissions(activity) {
  const {
    countryCodeISO2,
    durationHours,
    heatingSource,
    costAmount,
    costCurrency,
    energyWattHours,
  } = activity;

  const energyFootprint = (energyFootprints[heatingSource] || {}).kWh;
  if (!energyFootprint) {
    throw new Error(`Unable to find a footprint for heatingSource ${heatingSource}`);
  }

  // TODO: handle electricity somehow as `electricityCarbonIntensityMultiplier`
  // is the only key present for electricity sources.

  if (energyWattHours) {
    if (energyFootprint.country
      && countryCodeISO2
      && energyFootprint.country[countryCodeISO2]
      && energyFootprint.country[countryCodeISO2].intensityKilograms) {
      // TODO: kWhPerYearPerM2
      // Get country-specific values
      const countryCarbonIntensity = energyFootprint.country[countryCodeISO2].intensityKilograms;
      return energyWattHours / 1000.0 * countryCarbonIntensity;
    }
    // Use non-country specific estimator
    if (!energyFootprint.intensityKilograms) {
      throw new Error(`Unable to find a non-country-specific carbon intensity for heatingSource ${heatingSource}`);
    }
    return energyWattHours / 1000.0 * energyFootprint.intensityKilograms;
  }

  if (countryCodeISO2
    && countryCodeISO2
    && energyFootprint.country[countryCodeISO2]
    && energyFootprint.country[countryCodeISO2].kWhPerYear) {
    // Try to estimate usage based on country
    throw new Error('This isn\' implemented yet');
  } else {
    // Try to estimate usage without having a country
    throw new Error('This isn\' implemented yet');
  }
}
