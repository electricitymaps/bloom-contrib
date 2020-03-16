/**
 * Returns the duration in hours between the start and end of an activity
 * @param {Activity} activity Activity
 * @returns {number} Duration in hours between start and end of an activity. Returns null if no endDatetime
 */
export function getActivityDurationHours(activity) {
    if (!activity.endDatetime) return null;
    return (activity.endDatetime - activity.datetime) / 36e5;
}