import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Adds `extra.apiUrl` from `EXPO_PUBLIC_API_URL` (EAS / `.env` at build time).
 * Dev example: `http://192.168.1.10:3000` — LAN IP of the machine running `server`.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  return {
    ...base,
    extra: {
      ...(base.extra as Record<string, unknown>),
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    },
  };
};
