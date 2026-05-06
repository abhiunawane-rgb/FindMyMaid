import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, hitSlopComfort, spacing, typography } from '../theme';

type Props = {
  onPress: () => void;
  /** Visible label; screen readers get the same via accessibilityLabel */
  label?: string;
};

export function AuthBackRow({ onPress, label = 'Back' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={hitSlopComfort}
    >
      <Ionicons name="chevron-back" size={26} color={colors.primaryDark} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    minHeight: 48,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.75,
  },
  text: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    marginLeft: 2,
  },
});
