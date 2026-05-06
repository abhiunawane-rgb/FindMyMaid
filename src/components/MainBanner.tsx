import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { APP_DISPLAY_NAME } from '../constants/branding';
import { AppNameMark } from './AppNameMark';
import { BrandLogo } from './BrandLogo';
import { WEBSITE_BASE_URL } from '../constants/subscriptions';
import { colors, radius, shadows, spacing, touchMin, typography } from '../theme';

type Props = {
  role: 'user' | 'maid';
  /**
   * When false, omits the logo + name row (use when the screen already shows a large AppNameMark,
   * e.g. Find tab hero — reduces duplicate headlines and cognitive load).
   */
  showBrandRow?: boolean;
};

function IconBadge({
  name,
  label,
  accessibilityLabel,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  accessibilityLabel: string;
}) {
  return (
    <View
      style={styles.iconBadge}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={name} size={22} color={colors.primaryDark} />
      <Text style={styles.iconBadgeLabel} importantForAccessibility="no">
        {label}
      </Text>
    </View>
  );
}

export function MainBanner({ role, showBrandRow = true }: Props) {
  return (
    <View style={styles.wrap}>
      {showBrandRow ? (
        <View style={styles.heroCard}>
          <BrandLogo size="banner" pairedWithTitle style={styles.logo} />
          <View style={styles.heroTextWrap}>
            <AppNameMark variant="onLight" size="title" />
            <Text style={styles.heroSub} accessibilityLabel={`About ${APP_DISPLAY_NAME}`}>
              A discovery platform only: helpers register their profile; families search, compare, and
              contact. We do not provide services or process payment for work.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.infoRow}>
        <IconBadge
          name="location-outline"
          label="Nearby"
          accessibilityLabel="Nearby: location-based discovery"
        />
        <IconBadge name="star-outline" label="Ratings" accessibilityLabel="Ratings and reviews" />
        <IconBadge name="call-outline" label="Direct call" accessibilityLabel="Direct phone contact" />
      </View>

      <View style={styles.tipCard} accessibilityRole="summary" accessibilityLabel="Tip for using the app">
        <Text style={styles.tipTag}>Tip</Text>
        <Text style={styles.tipTitle}>
          {role === 'user'
            ? 'Premium unlocks unlimited contacts while your plan is active.'
            : 'Maid Pro helps more families see your profile.'}
        </Text>
        <Text style={styles.tipBody}>
          Always agree timing and pay directly with the helper. Stay safe and confirm identity in
          person.
        </Text>
        <Pressable
          onPress={() => Linking.openURL(WEBSITE_BASE_URL)}
          style={styles.learn}
          accessibilityRole="link"
          accessibilityLabel={`Open ${APP_DISPLAY_NAME} website`}
          hitSlop={8}
        >
          <Text style={styles.learnText}>Visit website</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  heroTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  heroSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 0,
  },
  iconBadge: {
    flex: 1,
    minHeight: touchMin + 8,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    gap: 6,
  },
  iconBadgeLabel: {
    ...typography.small,
    fontWeight: '600',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  tipCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.35)',
    padding: spacing.md,
  },
  tipTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.accentDark,
    marginBottom: 6,
  },
  tipTitle: {
    ...typography.small,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  tipBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  learn: {
    marginTop: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  learnText: {
    ...typography.small,
    color: colors.primaryDark,
    fontWeight: '600',
  },
});