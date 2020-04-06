import md5 from 'tiny-hashes/md5';
import moment from "moment";

/**
 * Returns the duration in hours between the start and end of an activity
 * @param {Activity} activity Activity
 * @returns {number} Duration in hours between start and end of an activity. Returns null if no endDatetime
 */
export function getActivityDurationHours(activity, precise = true) {
    if (!activity.endDatetime) return null;
    return moment(activity.endDatetime).diff(moment(activity.datetime), 'hours', precise);
}

/**
 * Returns the md5-checksum of an object
 * @param {*} obj
 */
export function getChecksum(obj) {
    return md5(JSON.stringify(obj));
}