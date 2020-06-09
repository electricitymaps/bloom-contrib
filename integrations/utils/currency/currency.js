const exchangeRates = require('./exchange_rates.json');
const exchangeRates2011 = require('./exchange_rates_2011.json');

export function convertToEuro(amount, currency) {
  if (currency.toUpperCase() === 'EUR') return amount;

  const exchangeRate = exchangeRates.rates[currency.toUpperCase()];
  if (!exchangeRate) throw new Error(`Unknown currency '${currency}'`);
  return amount / exchangeRate;
}

export function convertTo2011Euro(amount, currency) {
  if (currency.toUpperCase() === 'EUR') return amount;

  const exchangeRate2011 = exchangeRates2011.rates[currency.toUpperCase()];
  if (!exchangeRate2011) throw new Error(`Unknown currency '${currency}'`);
  return amount / exchangeRate2011;
}

export function getAvailableCurrencies() {
  return [...Object.keys(exchangeRates.rates), 'EUR'];
}
export function getAvailableCurrencies2011() {
  return [...Object.keys(exchangeRates2011.rates), 'EUR'];
}
