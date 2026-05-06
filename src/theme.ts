import { Platform } from 'react-native';

/**
 * FindMyMaid — colors from the mascot: yellow gloves (#FDCB01), uniform black, white apron.
 * Primary actions use yellow with black text for contrast (WCAG).
 */
export const colors = {
  /** Glove yellow — main CTAs, tabs, key accents */
  primary: '#FDCB01',
  /** Uniform black — body text, dark banners, hero overlays */
  primaryDark: '#1A1A1A',
  primaryMuted: '#FFF9E6',
  accent: '#FDCB01',
  accentDark: '#C9A000',
  accentMuted: '#FFF9E6',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#5C5C5C',
  border: '#E8E8E8',
  success: '#1B7A5C',
  warning: '#B8860B',
  overlay: 'rgba(0,0,0,0.45)',
  /** Text on yellow (primary) buttons */
  onPrimary: '#1A1A1A',
  /** Text on dark surfaces (hero strip, promos) */
  onDark: '#FFFFFF',
  onDarkMuted: '#D4D4D4',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 40,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  full: 999,
};

export const typography = {
  title: { fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.4 },
  headline: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '500' as const },
};

/** Fitts’s Law / WCAG 2.5.5: minimum interactive target (iOS HIG ~44pt, Material ~48dp). */
export const touchMin = 48;

/** Comfortable hit slop beyond visible bounds (reduces mis-taps). */
export const hitSlopComfort = { top: 12, bottom: 12, left: 12, right: 12 } as const;

/** Law of Proximity: vertical rhythm between related groups. */
export const sectionSpacing = {
  tight: spacing.sm,
  group: spacing.md,
  section: spacing.lg,
};

export const shadows = Platform.select({
  ios: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  android: { elevation: 6 },
  default: {},
});
