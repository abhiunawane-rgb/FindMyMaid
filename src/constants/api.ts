import Constants from 'expo-constants';

function readApiUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  const fromExtra = typeof extra?.apiUrl === 'string' ? extra.apiUrl.trim() : '';
  return fromExtra.replace(/\/$/, '');
}

/** Base URL of FindMyMaid API (no trailing slash). Empty = offline / local-only. */
export const API_BASE_URL = readApiUrl();

/** When true, auth and maid listing sync with the hosted API. */
export const API_SYNC_ENABLED = API_BASE_URL.length > 0;
