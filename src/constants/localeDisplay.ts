export type PricingCountry =
  | 'IN'
  | 'US'
  | 'GB'
  | 'EU'
  | 'AE'
  | 'CA'
  | 'AU'
  | 'SG';

type CurrencyConfig = {
  label: string;
  currencyCode: string;
  symbol: string;
  /** 1 INR => this many local currency units. */
  inrRate: number;
};

export const CURRENCY_CONFIG: Record<PricingCountry, CurrencyConfig> = {
  IN: { label: 'India', currencyCode: 'INR', symbol: 'Rs ', inrRate: 1 },
  US: { label: 'United States', currencyCode: 'USD', symbol: '$', inrRate: 0.012 },
  GB: { label: 'United Kingdom', currencyCode: 'GBP', symbol: 'GBP ', inrRate: 0.0095 },
  EU: { label: 'Europe', currencyCode: 'EUR', symbol: 'EUR ', inrRate: 0.011 },
  AE: { label: 'UAE', currencyCode: 'AED', symbol: 'AED ', inrRate: 0.044 },
  CA: { label: 'Canada', currencyCode: 'CAD', symbol: 'CAD ', inrRate: 0.017 },
  AU: { label: 'Australia', currencyCode: 'AUD', symbol: 'AUD ', inrRate: 0.018 },
  SG: { label: 'Singapore', currencyCode: 'SGD', symbol: 'SGD ', inrRate: 0.016 },
};

export const PRICING_COUNTRIES = Object.keys(CURRENCY_CONFIG) as PricingCountry[];

export const DEFAULT_PRICING_COUNTRY: PricingCountry = 'IN';

export function toLocalPrice(inrAmount: number, pricingCountry: PricingCountry): number {
  const cfg = CURRENCY_CONFIG[pricingCountry] ?? CURRENCY_CONFIG[DEFAULT_PRICING_COUNTRY];
  return Math.max(0, Math.round(Number(inrAmount) * cfg.inrRate));
}

export function formatPrice(inrAmount: number, pricingCountry: PricingCountry = DEFAULT_PRICING_COUNTRY): string {
  const cfg = CURRENCY_CONFIG[pricingCountry] ?? CURRENCY_CONFIG[DEFAULT_PRICING_COUNTRY];
  return `${cfg.symbol}${toLocalPrice(inrAmount, pricingCountry)}`;
}
