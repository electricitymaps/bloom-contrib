import { ACTIVITY_TYPE_DIGITAL, DIGITAL_CATEGORY_EMAIL } from '../../definitions';

export const modelName = 'email';
export const modelVersion = '1';
export const explanation = {
  text:
    'Calculations take into account the direct emissions associated with the email infrastructure worldwide.',
  links: [
    {
      label: 'Phys.org (2015)',
      href: 'https://phys.org/news/2015-11-carbon-footprint-email.html',
    },
  ],
};

export const modelCanRunVersion = 1;
export function modelCanRun(activity) {
  const { activityType } = activity;
  const isDigitalActivity = ACTIVITY_TYPE_DIGITAL === activityType;
  return (
    isDigitalActivity &&
    activity.lineItems &&
    activity.lineItems.filter(x => x.identifier === DIGITAL_CATEGORY_EMAIL).length > 0
  );
}
const worldCarbonIntensity = 4; // g/email
export function carbonEmissions(activity) {
  return (
    (activity.lineItems.filter(x => x.identifier === DIGITAL_CATEGORY_EMAIL).length *
      worldCarbonIntensity) /
    1000.0
  );
}
