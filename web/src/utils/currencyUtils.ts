/**
 * Formats a numeric amount into a currency string based on the provided currency code.
 * @param amount The numeric value to format
 * @param currencyCode The ISO currency code (e.g., 'INR', 'USD')
 * @param locale Optional locale (defaults to 'en-IN' for INR, 'en-US' for others)
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'INR',
  locale?: string
): string => {
  const effectiveLocale = locale || (currencyCode === 'INR' ? 'en-IN' : 'en-US');

  try {
    return new Intl.NumberFormat(effectiveLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error(`Error formatting currency: ${currencyCode}`, error);
    // Fallback if Intl.NumberFormat fails
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

/**
 * Converts an amount from one currency to another based on an exchange rate.
 * @param amount The amount in the source currency
 * @param rate The exchange rate (target / source)
 */
export const convertCurrency = (amount: number, rate: number): number => {
  return amount * rate;
};

/**
 * Gets the currency symbol for a given currency code.
 */
export const getCurrencySymbol = (currencyCode: string, locale: string = 'en-US'): string => {
  try {
    return (0).toLocaleString(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/\d/g, '').trim();
  } catch (e) {
    return currencyCode;
  }
};
/**
 * Resolves a price based on manual overrides or exchange rates.
 */
export const resolvePrice = (
  amount: number,
  originalCurrency: string,
  targetCurrency: string,
  exchangeRates: Record<string, number>,
  manualOverrides: Record<string, number> = {}
): number => {
  // 1. If manual override exists for this currency, use it
  if (manualOverrides && manualOverrides[targetCurrency] !== undefined && manualOverrides[targetCurrency] !== null) {
    return manualOverrides[targetCurrency];
  }

  // 2. If no manual override, and it's the same currency, return amount
  if (targetCurrency === originalCurrency) {
    return amount;
  }

  // 3. Fallback: Return the base amount without conversion (Auto-conversion removed)
  return amount;
};
