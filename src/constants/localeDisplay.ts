/**
 * In-app price display. Store billing (App Store / Play) uses the shopper’s store region.
 * Change `UI_CURRENCY_SYMBOL` (or extend with full ISO currency) when you localise pricing copy.
 */
export const UI_CURRENCY_SYMBOL = '₹';

export function formatPrice(amount: number): string {
  const n = Math.round(Number(amount));
  return `${UI_CURRENCY_SYMBOL}${n}`;
}
