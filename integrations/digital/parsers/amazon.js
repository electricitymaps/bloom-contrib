import { ACTIVITY_TYPE_PURCHASE, UNIT_CURRENCIES } from '../../../definitions';

const fromEmails = ['digital-no-reply@amazon.ca', 'shipment-tracking@amazon.ca'];
function getCurrencyAndCountryCode(signal) {
  if (signal === 'CDN') {
    return { cur: UNIT_CURRENCIES.CAD, code: 'CA' };
  }
  return { cur: UNIT_CURRENCIES.EUR, code: 'FR' };
}
function findLastMatch(regex, str) {
  regex.lastIndex = 0;
  let lastMatch;
  let match;
  do {
    match = regex.exec(str);
    if (match) {
      lastMatch = match;
    }
  } while (match);
  regex.lastIndex = 0;
  return lastMatch;
}
export function evaluateEmail(subject, from, bodyAsHtml, sendDate) {
  if (from !== undefined && fromEmails.indexOf(from.toLowerCase()) !== -1) {
    const priceRegex = /<strong>(\w{3})\$?\s+(\d+\.\d{2})<\/strong>/gm; // last match, currency group 1, price group2
    const priceMatches = priceRegex.exec(bodyAsHtml);
    const orderRegex = /orderID%3D(D?[\d-]+)&/gm; // unique match group 1
    const orderMatches = orderRegex.exec(bodyAsHtml);
    if (priceMatches.length > 0 && orderMatches && orderMatches.length > 0) {
      const priceMatch = findLastMatch(priceRegex, bodyAsHtml);
      const price = parseFloat(priceMatch[2]);
      const currencySignal = priceMatch[1];
      const currencyAndCode = getCurrencyAndCountryCode(currencySignal);
      return {
        id: `AMAZON-${orderMatches.length > 1 && orderMatches[1]}`,
        datetime: sendDate,
        label: `AMAZON order ${orderMatches.length > 1 && orderMatches[1]}`,
        activityType: ACTIVITY_TYPE_PURCHASE,
        merchantDisplayName: 'AMAZON',
        lineItems: [
          {
            value: price,
            countryCodeISO2: currencyAndCode.code,
            unit: currencyAndCode.cur,
          },
        ],
      };
    }
  }
  return undefined;
}
