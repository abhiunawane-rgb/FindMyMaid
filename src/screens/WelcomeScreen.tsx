import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppNameMark } from '../components/AppNameMark';
import { BrandLogo } from '../components/BrandLogo';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { colors, radius, shadows, spacing, typography } from '../theme';

export function WelcomeScreen() {
  const { setRole } = useApp();
  return (
    <Screen scroll>
      <View>
        <LinearGradient
          colors={[colors.surface, colors.accentMuted, colors.primaryMuted]}
          style={styles.hero}
        >
          <BrandLogo size="welcome" pairedWithTitle style={styles.heroLogo} />
          <AppNameMark variant="onLight" size="hero" alignCenter style={styles.heroNameMark} />
          <View style={styles.pill}>
            <Ionicons name="sparkles" size={14} color={colors.primaryDark} style={styles.pillIcon} />
            <Text style={styles.pillText}>Simple · Nearby · Direct contact</Text>
          </View>
          <Text style={styles.tagline}>
            Find trusted home help near you. Call directly — no booking or payment in the app.
          </Text>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Who are you?</Text>
        <Text style={styles.hint}>
          Choose one path. You can use another account on a different device later.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="I need home help. Find helpers near you and contact directly."
          accessibilityHint="Continues to sign-in for families"
          onPress={() => setRole('user')}
          style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
        >
          <LinearGradient
            colors={[colors.surface, colors.accentMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.roleGradient}
          >
            <View style={[styles.roleAccentBar, { backgroundColor: colors.primary }]} />
            <View style={styles.roleRow}>
              <View style={[styles.iconBubble, styles.iconBubbleNeed]}>
                <Ionicons name="home-outline" size={28} color={colors.primaryDark} />
              </View>
              <View style={styles.roleCopy}>
                <Text style={styles.roleTitle}>I need home help</Text>
                <Text style={styles.roleSub}>Browse profiles, compare rates, call or WhatsApp</Text>
              </View>
              <View style={styles.chevronWrap}>
                <Ionicons name="chevron-forward" size={22} color={colors.primaryDark} />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="I offer home help. List your services and rates for nearby families."
          accessibilityHint="Continues to sign-in for helpers"
          onPress={() => setRole('maid')}
          style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
        >
          <LinearGradient
            colors={[colors.primaryMuted, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.roleGradient}
          >
            <View style={[styles.roleAccentBar, { backgroundColor: colors.primaryDark }]} />
            <View style={styles.roleRow}>
              <View style={[styles.iconBubble, styles.iconBubbleOffer]}>
                <Ionicons name="briefcase-outline" size={26} color={colors.primaryDark} />
              </View>
              <View style={styles.roleCopy}>
                <Text style={styles.roleTitle}>I offer home help</Text>
                <Text style={styles.roleSub}>Show services, set rates, receive contacts</Text>
              </View>
              <View style={styles.chevronWrap}>
                <Ionicons name="chevron-forward" size={22} color={colors.primaryDark} />
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primaryDark} />
          <Text style={styles.noteText}>
            We only help you discover people nearby and contact them. Agreements happen outside the
            app.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroNameMark: {
    marginBottom: spacing.sm,
  },
  heroLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.xs,
    gap: 6,
  },
  pillIcon: {
    marginTop: 0,
  },
  pillText: {
    ...typography.small,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  roleCard: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows,
  },
  roleCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.992 }],
  },
  roleGradient: {
    position: 'relative',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 100,
    justifyContent: 'center',
  },
  roleAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    gap: spacing.md,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  iconBubbleNeed: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  iconBubbleOffer: {
    backgroundColor: colors.surface,
    borderColor: colors.primaryDark,
  },
  roleCopy: {
    flex: 1,
    minWidth: 0,
  },
  roleTitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: colors.text,
    marginBottom: 4,
  },
  roleSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  chevronWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  noteText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
});
