import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { APP_DISPLAY_NAME } from '../constants/branding';
import { colors } from '../theme';

type Variant = 'onLight' | 'onDark';
type Size = 'hero' | 'title' | 'nav' | 'caption';

type Props = {
  variant: Variant;
  size: Size;
  style?: StyleProp<ViewStyle>;
  /** Center the name row (e.g. welcome hero). */
  alignCenter?: boolean;
};

const SIZE_MAP: Record<
  Size,
  { find: TextStyle; my: TextStyle; maid: TextStyle; rowGap: number }
> = {
  hero: {
    find: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
    my: { fontSize: 34, fontWeight: '600', letterSpacing: -0.8 },
    maid: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
    rowGap: 0,
  },
  title: {
    find: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    my: { fontSize: 24, fontWeight: '600', letterSpacing: -0.5 },
    maid: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    rowGap: 0,
  },
  nav: {
    find: { fontSize: 18, fontWeight: '800', letterSpacing: -0.35 },
    my: { fontSize: 18, fontWeight: '600', letterSpacing: -0.35 },
    maid: { fontSize: 18, fontWeight: '800', letterSpacing: -0.35 },
    rowGap: 0,
  },
  caption: {
    find: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
    my: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
    maid: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
    rowGap: 0,
  },
};

/**
 * Highlights the product name for recognition (Jakob’s Law) with clear hierarchy (visual weight on “Find” + “Maid”).
 * Accessibility: one spoken name, decorative split for sighted users only.
 */
export function AppNameMark({ variant, size, style, alignCenter }: Props) {
  const s = SIZE_MAP[size];
  const onLight = variant === 'onLight';
  const findC = onLight ? colors.primaryDark : colors.onDark;
  const myC = onLight ? colors.textSecondary : 'rgba(255,255,255,0.82)';

  const maidInner: TextStyle = onLight
    ? {
        ...s.maid,
        color: colors.onPrimary,
        backgroundColor: colors.primary,
        paddingHorizontal: size === 'hero' ? 10 : 8,
        paddingVertical: size === 'hero' ? 4 : 3,
        borderRadius: size === 'hero' ? 12 : 10,
        overflow: 'hidden',
      }
    : {
        ...s.maid,
        color: colors.primary,
      };

  const label = APP_DISPLAY_NAME;
  const outerRole = size === 'hero' ? ('header' as const) : ('text' as const);

  return (
    <View
      accessible
      accessibilityRole={outerRole}
      accessibilityLabel={label}
      style={[styles.wrap, alignCenter && styles.center, style]}
    >
      <Text
        style={[styles.row, { marginBottom: s.rowGap }]}
        maxFontSizeMultiplier={1.35}
        importantForAccessibility="no"
      >
        <Text style={[s.find, { color: findC }]}>Find</Text>
        <Text style={[s.my, { color: myC }]}>{' My '}</Text>
        <Text style={maidInner}>Maid</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 1,
  },
  center: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});
