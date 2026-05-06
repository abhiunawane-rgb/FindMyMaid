import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

/** Source file: project root `Cheerful maid in yellow gloves.png` → copied to `assets/brand-logo.png` and store/website icons. */
const LOGO = require('../../assets/brand-logo.png');

const SIZES = {
  /** Nav / inline auth (~40dp) — Fitts: visible mark without crowding forms */
  nav: 40,
  inline: 36,
  /** Home banner card */
  banner: 56,
  /** Welcome hero */
  welcome: 72,
} as const;

export type BrandLogoSize = keyof typeof SIZES;

type Props = {
  size?: BrandLogoSize;
  /** When true, logo is redundant with adjacent “FindMyMaid” text — hide from screen readers (WCAG decorative image). */
  pairedWithTitle?: boolean;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

export function BrandLogo({
  size = 'banner',
  pairedWithTitle = false,
  style,
  accessibilityLabel = 'FindMyMaid logo: cheerful home helper in yellow gloves',
}: Props) {
  const dim = SIZES[size];
  return (
    <Image
      source={LOGO}
      style={[{ width: dim, height: dim, borderRadius: dim / 2 }, style]}
      accessible={!pairedWithTitle}
      accessibilityRole="image"
      accessibilityLabel={pairedWithTitle ? undefined : accessibilityLabel}
      {...(pairedWithTitle ? { importantForAccessibility: 'no' as const } : {})}
    />
  );
}
