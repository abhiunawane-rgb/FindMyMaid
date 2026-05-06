import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, touchMin, typography } from '../theme';

type Action = { label: string; onPress: () => void; variant?: 'primary' | 'secondary' };

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  primaryAction?: Action;
  secondaryAction?: Action;
};

/**
 * Calm blank / zero-data layout — use when lists or markets have nothing to show (new regions, filters, permissions).
 */
export function EmptyState({ icon, title, description, primaryAction, secondaryAction }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="text">
      <View style={styles.iconCircle} accessibilityElementsHidden importantForAccessibility="no">
        <Ionicons name={icon} size={40} color={colors.primaryDark} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {primaryAction ? (
        <Pressable
          onPress={primaryAction.onPress}
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={primaryAction.label}
        >
          <Text style={styles.btnPrimaryText}>{primaryAction.label}</Text>
        </Pressable>
      ) : null}
      {secondaryAction ? (
        <Pressable
          onPress={secondaryAction.onPress}
          style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={secondaryAction.label}
        >
          <Text style={styles.btnSecondaryText}>{secondaryAction.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    maxWidth: 360,
    alignSelf: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headline,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  btnPrimary: {
    minHeight: touchMin,
    minWidth: 200,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  btnPrimaryText: {
    ...typography.bodyMedium,
    color: colors.onPrimary,
  },
  btnSecondary: {
    minHeight: touchMin,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  pressed: { opacity: 0.88 },
});
