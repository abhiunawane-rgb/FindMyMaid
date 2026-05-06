/** Digits only. */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Normalize national-style numbers so the same SIM produces one stable id.
 * - India +91 with 10-digit local → last 10 digits
 * - Leading 0 on 11-digit local trunk prefix (e.g. 0XXXXXXXXXX) → drop the 0
 */
export function normalizePhoneDigits(input: string): string {
  let d = digitsOnly(input);
  if (d.length >= 12 && d.startsWith('91')) {
    return d.slice(-10);
  }
  if (d.length === 11 && d.startsWith('0')) {
    return d.slice(1);
  }
  return d;
}

/** Stable helper id for discovery + leads (no backend yet). */
export function maidIdFromPhone(phone: string): string {
  const d = normalizePhoneDigits(phone);
  return d.length ? `maid_${d}` : `maid_${Date.now()}`;
}
