import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Glass-style panel. Uses translucent layers instead of expo-blur native views —
 * avoids "Exception in HostFunction" crashes in Expo Go on some iOS builds.
 */
export function GlassCard({ children, style }: Props) {
  return <View style={[styles.glass, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  glass: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(17, 50, 74, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
});
