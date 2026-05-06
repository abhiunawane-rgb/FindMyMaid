/** INR pricing — replace with App Store / Play Console product IDs in production */
export const USER_PLANS = {
  monthly: {
    id: 'fmm_user_premium_monthly',
    priceInr: 199,
    label: 'Monthly',
    durationMs: 30 * 24 * 60 * 60 * 1000,
  },
  yearly: {
    id: 'fmm_user_premium_yearly',
    priceInr: 1499,
    label: 'Yearly',
    durationMs: 365 * 24 * 60 * 60 * 1000,
    /** vs 12× monthly */
    discountPercent: Math.round(
      (1 - 1499 / (199 * 12)) * 100
    ),
  },
} as const;

export const MAID_PLANS = {
  monthly: {
    id: 'fmm_maid_pro_monthly',
    priceInr: 299,
    label: 'Monthly',
    durationMs: 30 * 24 * 60 * 60 * 1000,
  },
  yearly: {
    id: 'fmm_maid_pro_yearly',
    priceInr: 2299,
    label: 'Yearly',
    durationMs: 365 * 24 * 60 * 60 * 1000,
    discountPercent: Math.round(
      (1 - 2299 / (299 * 12)) * 100
    ),
  },
} as const;

export const FREE_LEADS_PER_MONTH = 3;
/** Lifetime free contacts for families before Premium (not monthly). */
export const FREE_CONTACTS_TOTAL = 3;

/** Public website base URL — used for Privacy Policy links in app */
export const WEBSITE_BASE_URL = 'https://www.findmymaid.online';
