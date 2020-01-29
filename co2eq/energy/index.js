import md5 from 'tiny-hashes/md5';

import {
  ELECTRICITY_ACTIVITIES,
} from '../../definitions';
import energyFootprints from './energyfootprints.yml';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'energy';
const ymlChecksum = md5(JSON.stringify(energyFootprints));
export const modelVersion = `1_${ymlChecksum}`; // This model relies on footprints.yaml
export const explanation = {
  text: 'Calculations take into account use of electricity and heating, based on fuel source',
  links: [
    { label: 'ICAX (2019)', href: 'https://www.icax.co.uk/Decarbonising_Heating_2022.html' },
    { label: 'The Parliamentary Office of Science and Technology (2016)', href: 'http://researchbriefings.files.parliament.uk/documents/POST-PN-0523/POST-PN-0523.pdf' },
    { label: 'Hotmaps Project (2018)', href: 'www.hotmaps-project.eu' },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { heatingSource, activityType } = activity;
  // Leave the electric activities up to the electricity model
  const isElectricActivity = ELECTRICITY_ACTIVITIES.includes(activityType);
  if (!heatingSource || isElectricActivity) {
    return false;
  }
  return true;
}

function correctWithParticipants(footprint, participants) {
  return footprint / (participants || 1);
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
function carbonEmissionsWithoutParticipants(activity) {
  const {
    countryCodeISO2,
    heatingSource,
    energyWattHours,
  } = activity;

  if (!heatingSource) {
    throw new Error('Missing heatingSource');
  }

  const energyFootprint = (energyFootprints[heatingSource] || {}).kWh;
  if (!energyFootprint) {
    throw new Error(`Unable to find a footprint for heatingSource ${heatingSource}`);
  }
  if (energyWattHours == null) {
    throw new Error('Missing energyWattHours');
  }

  // Check if we can use the country-specific estimate
  if (energyFootprint.country
    && countryCodeISO2
    && energyFootprint.country[countryCodeISO2]
    && energyFootprint.country[countryCodeISO2].intensityKilograms) {
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

export function carbonEmissions(activity) {
  return correctWithParticipants(
    carbonEmissionsWithoutParticipants(activity),
    activity.participants
  );
}
