import { evaluateEmail as amazonParser } from './amazon';
import { evaluateEmail as ikeaParser } from './ikea';

const parsers = [ikeaParser, amazonParser];

export function getActivitiesFromEmail(subject, from, bodyAsHtml, sendDate) {
  return parsers.map((y) => y(subject, from, bodyAsHtml, sendDate)).filter((x) => x !== undefined);
}
