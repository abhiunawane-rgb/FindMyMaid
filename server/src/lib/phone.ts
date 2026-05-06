/** Match `src/utils/maidId.ts` in the mobile app. */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

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

export function maidPublicIdFromPhoneNorm(phoneNorm: string): string {
  return phoneNorm.length ? `maid_${phoneNorm}` : `maid_${Date.now()}`;
}

/**
 * E.164 for Twilio SMS. Uses PHONE_DEFAULT_CC (e.g. 91) when the user omits country code.
 */
export function toE164Phone(input: string): string | null {
  const t = input.trim();
  if (t.startsWith('+')) {
    const d = digitsOnly(t);
    if (d.length < 10 || d.length > 15) return null;
    return `+${d}`;
  }
  const norm = normalizePhoneDigits(t);
  if (norm.length < 8 || norm.length > 15) return null;
  const cc = (process.env.PHONE_DEFAULT_CC ?? '91').replace(/\D/g, '');
  if (!cc) return null;
  return `+${cc}${norm}`;
}
