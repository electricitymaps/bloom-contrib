import { evaluateEmail as ikeaParser } from './ikea';

const parsers = [ikeaParser];

export function getActivitiesFromEmail(subject, from, bodyAsHtml, sendDate) {
  return parsers.map(y => y(subject, from, bodyAsHtml, sendDate)).filter(x => x !== undefined);
}
