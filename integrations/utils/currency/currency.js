const exchangeRates = require('./exchange_rates.json');

export function convertToEuro(amount, currency) {
  if (currency.toUpperCase() === 'EUR') return amount;
  
  const exchangeRate = exchangeRates.rates[currency.toUpperCase()];
  if (!exchangeRate) throw new Error(`Unkown currency '${currency}'`);

  return amount / exchangeRate;
}
