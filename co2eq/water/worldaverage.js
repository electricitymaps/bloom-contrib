import { ACTIVITY_TYPE_WATER } from '../../definitions';

export const modelName = 'water-world-average';
export const modelVersion = '1';
export const explanation = {
  text:
    'Calculations take into account the direct emissions associated with the water treatment worldwide.',
  links: [
    {
      label: "Hidden greenhouse gas emissions for water utilities in China's cities",
      href: 'https://www.sciencedirect.com/science/article/pii/S0959652617312118',
    },
    {
      label:
        'Measuring scope 3 carbon emissions – water and waste Report to HEFCE by Arup and De Montfort University January 2012',
      href: 'https://dera.ioe.ac.uk/13480/1/water.pdf',
    },
  ],
};

const worldCarbonIntensity = 1040; // g/m3

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { waterCubicMeters, activityType } = activity;
  const isWaterActivity = activityType === ACTIVITY_TYPE_WATER;
  return isWaterActivity && waterCubicMeters;
}
function correctWithParticipants(footprint, participants) {
  return footprint / (participants || 1);
}
function carbonEmissionsWithoutParticipants(activity) {
  return (activity.waterCubicMeters * worldCarbonIntensity) / 1000.0;
}

export function carbonEmissions(activity) {
  return correctWithParticipants(
    carbonEmissionsWithoutParticipants(activity),
    activity.participants
  );
}
