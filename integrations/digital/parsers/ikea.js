import {
  ACTIVITY_TYPE_PURCHASE,
  UNIT_CURRENCIES,
  PURCHASE_CATEGORY_STORE_FURNISHING,
} from '../../../definitions';

const fromEmails = ['donotreply@ikea.com'];
function getCurrencyAndCountryCode(bodyAsHtml) {
  if (bodyAsHtml.indexOf('IKEA Canada') > -1) {
    return { cur: UNIT_CURRENCIES.CAD, code: 'CA' };
  }
  return { cur: UNIT_CURRENCIES.EUR, code: 'FR' };
}
export function evaluateEmail(subject, from, bodyAsHtml, sendDate) {
  if (from !== undefined && fromEmails.indexOf(from.toLowerCase()) !== -1) {
    const priceMatches = /<b>\$([\d,.]+)/gm.exec(bodyAsHtml);
    const orderMatches = /(\d{9})/gm.exec(bodyAsHtml);
    const currencyAndCode = getCurrencyAndCountryCode(bodyAsHtml);
    if (priceMatches && priceMatches.length > 1 && priceMatches[1]) {
      return {
        id: `IKEA-${orderMatches.length > 1 && orderMatches[1]}`,
        datetime: sendDate,
        label: `Ikea order ${orderMatches.length > 1 && orderMatches[1]}`,
        activityType: ACTIVITY_TYPE_PURCHASE,
        supplierName: 'Ikea',
        countryCodeISO2: currencyAndCode.code,
        lineItems: [
          {
            identifier: PURCHASE_CATEGORY_STORE_FURNISHING,
            value: parseFloat(priceMatches[1]),
            unit: currencyAndCode.cur,
          },
        ],
      };
    }
  }
  return undefined;
}
