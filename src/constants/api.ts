import Constants from 'expo-constants';

/** From app.config.ts `extra.apiUrl` (EAS builds inject EXPO_PUBLIC_API_URL there). */
function readExtraApiUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  const fromExtra = typeof extra?.apiUrl === 'string' ? extra.apiUrl.trim() : '';
  return fromExtra.replace(/\/$/, '');
}

/** Fallback: Metro / EAS inlines EXPO_PUBLIC_* at bundle time — keeps sync if extra is stale. */
function readPublicEnvApiUrl(): string {
  try {
    const raw = process.env.EXPO_PUBLIC_API_URL;
    if (typeof raw === 'string') {
      const t = raw.trim();
      return t.replace(/\/$/, '');
    }
  } catch {
    /* noop */
  }
  return '';
}

/** Base URL of FindMyMaid API (no trailing slash). Empty = offline / local-only. */
export const API_BASE_URL = readExtraApiUrl() || readPublicEnvApiUrl();

/** When true, auth and maid listing sync with the hosted API. */
export const API_SYNC_ENABLED = API_BASE_URL.length > 0;

/** Matches backend auth / discover calls — avoid infinite spinner on OTP. */
export const API_FETCH_TIMEOUT_MS = 35000;
