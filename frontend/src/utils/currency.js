// Static approximate exchange rates relative to USD (1 USD = X target currency)
export const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.5,
  JPY: 152.0,
  AUD: 1.55,
  CAD: 1.38
};

export const CURRENCY_INFO = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' }
};

export const SUPPORTED_CURRENCIES = Object.keys(EXCHANGE_RATES);

/**
 * Safely converts an amount from source currency to target currency.
 * Returns 0 if amount is invalid, NaN, empty, or negative.
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount < 0) {
    return 0;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1.0;
  const toRate = EXCHANGE_RATES[toCurrency] || 1.0;

  const amountInUSD = numericAmount / fromRate;
  const convertedAmount = amountInUSD * toRate;

  return convertedAmount;
};

/**
 * Formats currency nicely with its symbol.
 */
export const formatCurrencyAmount = (amount, currencyCode) => {
  const info = CURRENCY_INFO[currencyCode] || { symbol: '$', name: currencyCode };
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return `${info.symbol}0.00`;

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2
  }).format(numericAmount);

  return `${info.symbol}${formattedNumber}`;
};
