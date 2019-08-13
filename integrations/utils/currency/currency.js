const exchangeRates = require('./exchange_rates.json');

export function convertToEuro(amount, currency) {
  if (currency.toUpperCase() === 'EUR') return amount;

  const exchangeRate = exchangeRates.rates[currency.toUpperCase()];
  if (!exchangeRate) throw new Error(`Unknown currency '${currency}'`);

  return amount / exchangeRate;
}

export function getAvailableCurrencies() {
  return [...Object.keys(exchangeRates.rates), 'EUR'];
}
