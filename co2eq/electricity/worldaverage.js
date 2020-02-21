import {
  ELECTRICITY_ACTIVITIES,
} from '../../definitions';

// ** modelName must not be changed. If changed then old activities will not be re-calculated **
export const modelName = 'elecitricity-world-average';
export const modelVersion = '1';
export const explanation = {
  text: 'Calculations take into account the direct emissions associated with the generation of electricity worldwide.',
  links: [
    { label: 'IEA (2019)', href: 'https://www.iea.org/reports/global-energy-co2-status-report-2019/emissions' },
  ],
};

const worldCarbonIntensity = 475; // g/kWh

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const {
    energyWattHours,
    durationHours,
    activityType,
  } = activity;
  const isElectricActivity = ELECTRICITY_ACTIVITIES.includes(activityType);
  return isElectricActivity && energyWattHours && durationHours;
}

function correctWithParticipants(footprint, participants) {
  return footprint / (participants || 1);
}

/*
Carbon emissions of an activity (in kgCO2eq)
*/
function carbonEmissionsWithoutParticipants(activity) {
  return (activity.energyWattHours / 1000.0 * worldCarbonIntensity) / 1000.0;
}

export function carbonEmissions(activity) {
  return correctWithParticipants(
    carbonEmissionsWithoutParticipants(activity),
    activity.participants
  );
}
