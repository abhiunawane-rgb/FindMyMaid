import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppNameMark } from '../components/AppNameMark';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { CURRENCY_CONFIG, PRICING_COUNTRIES, formatPrice } from '../constants/localeDisplay';
import { USER_PLANS, WEBSITE_BASE_URL } from '../constants/subscriptions';
import { useApp, type PlanPeriod } from '../context/AppContext';
import { colors, radius, shadows, spacing, touchMin, typography } from '../theme';

const H_PAD = spacing.lg;

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string }[] = [
  {
    icon: 'call-outline',
    title: 'Unlimited phone & WhatsApp',
    sub: 'Contact as many helpers as you need while subscribed.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Same discovery platform',
    sub: 'We connect you — you agree timing and pay helpers directly.',
  },
  {
    icon: 'refresh-outline',
    title: 'Flexible billing',
    sub: 'Monthly or yearly. Manage renewal from your profile settings.',
  },
];

export function UserPremiumScreen() {
  const { isUserPremium, purchaseUserPremium, state, FREE_CONTACTS_TOTAL, setPricingCountry } = useApp();
  const premium = isUserPremium();
  const [selected, setSelected] = useState<PlanPeriod>('yearly');

  const yearlySave = USER_PLANS.yearly.discountPercent;
  const used = state.freeContactsUsed;
  const freePct = useMemo(
    () => Math.min(100, Math.round((used / FREE_CONTACTS_TOTAL) * 100)),
    [used]
  );

  const openPrivacy = () => {
    Linking.openURL(`${WEBSITE_BASE_URL}/privacy.html`).catch(() => {});
  };

  const onBuy = () => {
    purchaseUserPremium(selected);
  };

  const activeUntil =
    premium && state.userPremiumUntil
      ? new Date(state.userPremiumUntil).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

  return (
    <Screen scroll flushTop safeAreaTop={false}>
      <View style={styles.bleed}>
        <LinearGradient
          colors={['#FDCB01', '#FFDF6B', '#FFF4CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroArc} />
          <View style={styles.heroTopRow}>
            <View style={styles.crownWrap}>
              <Ionicons name="ribbon" size={26} color={colors.primary} />
            </View>
            <View style={[styles.livePill, premium ? styles.livePillOn : styles.livePillOff]}>
              <View style={[styles.liveDot, premium && styles.liveDotOn]} />
              <Text style={[styles.livePillText, premium && styles.livePillTextOn]}>
                {premium ? 'Member' : 'Guest'}
              </Text>
            </View>
          </View>

          <AppNameMark variant="onLight" size="caption" alignCenter style={styles.heroKickerWrap} />
          <Text style={styles.heroTitle}>Premium</Text>
          <Text style={styles.heroSub}>
            Unlimited introductions to helpers while your subscription is active.
          </Text>

          {premium && activeUntil ? (
            <View style={styles.renewChip}>
              <Ionicons name="calendar-outline" size={16} color={colors.primaryDark} />
              <Text style={styles.renewChipText}>Active through {activeUntil}</Text>
            </View>
          ) : null}
        </LinearGradient>
      </View>

      <View style={styles.body}>
        {premium ? (
          <View style={styles.memberBanner}>
            <LinearGradient
              colors={['#1A1A1A', '#2E2E2E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.memberBannerInner}
            >
              <Ionicons name="infinite" size={28} color={colors.primary} />
              <View style={styles.memberBannerCopy}>
                <Text style={styles.memberBannerTitle}>Unlimited contacts</Text>
                <Text style={styles.memberBannerSub}>
                  Reach helpers without using your lifetime free introductions.
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.usagePanel}>
            <View style={styles.usagePanelHeader}>
              <Text style={styles.usagePanelLabel}>Free introductions (lifetime)</Text>
              <Text style={styles.usagePanelCount}>
                {used} / {FREE_CONTACTS_TOTAL}
              </Text>
            </View>
            <View style={styles.usageBarBg}>
              <LinearGradient
                colors={[colors.primary, '#E8B800']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.usageBarFill, { width: `${freePct}%` }]}
              />
            </View>
            <Text style={styles.usagePanelHint}>
              {used >= FREE_CONTACTS_TOTAL
                ? 'You’ve used all free intros — pick a plan below.'
                : `${FREE_CONTACTS_TOTAL - used} free introduction${FREE_CONTACTS_TOTAL - used === 1 ? '' : 's'} remaining.`}
            </Text>
          </View>
        )}

        <Text style={styles.sectionKicker}>INCLUDED</Text>
        <Text style={styles.sectionTitle}>What you unlock</Text>
        <View style={styles.featureStack}>
          {FEATURES.map((f, i) => (
            <View key={f.title} style={styles.featureStep}>
              <View style={styles.featureStepNum}>
                <Text style={styles.featureStepNumText}>{i + 1}</Text>
              </View>
              <View style={styles.featureStepBody}>
                <View style={styles.featureStepHead}>
                  <Ionicons name={f.icon} size={20} color={colors.primaryDark} />
                  <Text style={styles.featureTitle}>{f.title}</Text>
                </View>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionKicker}>DISPLAY</Text>
        <Text style={styles.sectionTitle}>Currency & billing region</Text>
        <Text style={styles.currencySub}>
          How prices appear in the app below. Checkout still uses Apple or Google in your locale.
        </Text>
        <View style={styles.countryRow}>
          {PRICING_COUNTRIES.map((country) => (
            <Pressable
              key={country}
              onPress={() => setPricingCountry(country)}
              style={[styles.countryChip, state.pricingCountry === country && styles.countryChipOn]}
              accessibilityRole="button"
              accessibilityLabel={`Pricing in ${country}`}
            >
              <Text style={[styles.countryChipText, state.pricingCountry === country && styles.countryChipTextOn]}>
                {country} · {CURRENCY_CONFIG[country].currencyCode}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionKicker}>PLANS</Text>
        <Text style={styles.sectionTitle}>Choose billing</Text>

        <View style={styles.planCompare} accessibilityRole="radiogroup" accessibilityLabel="Choose billing period">
          <Pressable
            onPress={() => setSelected('monthly')}
            style={[styles.planTile, selected === 'monthly' && styles.planTileOn]}
            accessibilityRole="radio"
            accessibilityLabel="Monthly billing"
            accessibilityState={{ selected: selected === 'monthly' }}
          >
            <View style={styles.planBadgeRow} />
            <View style={[styles.planRadio, selected === 'monthly' && styles.planRadioOn]}>
              {selected === 'monthly' ? <View style={styles.planRadioDot} /> : null}
            </View>
            <Text style={styles.planTileLabel}>Monthly</Text>
            <Text style={styles.planTilePrice}>
              {formatPrice(USER_PLANS.monthly.priceInr, state.pricingCountry)}
            </Text>
            <Text style={styles.planTileUnit}>per month</Text>
          </Pressable>

          <Pressable
            onPress={() => setSelected('yearly')}
            style={[styles.planTile, styles.planTileFeatured, selected === 'yearly' && styles.planTileOn]}
            accessibilityRole="radio"
            accessibilityLabel="Yearly billing"
            accessibilityState={{ selected: selected === 'yearly' }}
          >
            <View style={styles.planBadgeRow}>
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>~{yearlySave}% off</Text>
              </View>
            </View>
            <View style={[styles.planRadio, selected === 'yearly' && styles.planRadioOn]}>
              {selected === 'yearly' ? <View style={styles.planRadioDot} /> : null}
            </View>
            <Text style={styles.planTileLabel}>Yearly</Text>
            <Text style={styles.planTilePrice}>
              {formatPrice(USER_PLANS.yearly.priceInr, state.pricingCountry)}
            </Text>
            <Text style={styles.planTileUnit}>per year · best value</Text>
          </Pressable>
        </View>

        <Text style={styles.legal}>
          Demo purchase. Production builds use in-app products ({USER_PLANS.monthly.id},{' '}
          {USER_PLANS.yearly.id}). Turn off auto-renew in Settings.
        </Text>

        <PrimaryButton
          title={
            premium
              ? `Extend (${selected === 'yearly' ? 'Yearly' : 'Monthly'}) — demo`
              : `Subscribe — ${formatPrice(
                  selected === 'yearly' ? USER_PLANS.yearly.priceInr : USER_PLANS.monthly.priceInr,
                  state.pricingCountry
                )}`
          }
          onPress={onBuy}
        />

        <Pressable
          onPress={openPrivacy}
          style={styles.linkBtn}
          accessibilityRole="link"
          accessibilityLabel="Privacy policy"
          accessibilityHint="Opens the privacy policy in your browser"
        >
          <Text style={styles.linkText}>Privacy policy (website)</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bleed: {
    marginHorizontal: -H_PAD,
    marginBottom: spacing.md,
  },
  hero: {
    paddingTop: spacing.lg + spacing.xs,
    paddingBottom: spacing.xl + spacing.sm,
    paddingHorizontal: H_PAD,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  heroArc: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 26, 0.04)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  crownWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.12)',
  },
  livePillOn: {
    backgroundColor: 'rgba(27, 122, 92, 0.15)',
    borderColor: 'rgba(27, 122, 92, 0.35)',
  },
  livePillOff: {},
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  liveDotOn: {
    backgroundColor: colors.success,
  },
  livePillText: {
    ...typography.small,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  livePillTextOn: {
    color: colors.success,
  },
  heroKickerWrap: {
    marginBottom: 6,
    opacity: 0.95,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  heroSub: {
    ...typography.caption,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    maxWidth: 340,
  },
  renewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(26,26,26,0.08)',
  },
  renewChipText: {
    ...typography.small,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  body: {
    paddingBottom: spacing.sm,
  },
  usagePanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows,
  },
  usagePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  usagePanelLabel: {
    ...typography.small,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  usagePanelCount: {
    ...typography.headline,
    fontSize: 20,
    color: colors.primaryDark,
  },
  usageBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    borderRadius: 5,
    maxWidth: '100%',
  },
  usagePanelHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  memberBanner: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows,
  },
  memberBannerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
  },
  memberBannerCopy: {
    flex: 1,
  },
  memberBannerTitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: colors.onDark,
    marginBottom: 4,
  },
  memberBannerSub: {
    ...typography.caption,
    color: colors.onDarkMuted,
    lineHeight: 20,
  },
  sectionKicker: {
    ...typography.small,
    fontWeight: '800',
    color: colors.accentDark,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  currencySub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  countryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  countryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  countryChipOn: {
    borderColor: colors.accentDark,
    backgroundColor: colors.primaryMuted,
  },
  countryChipText: {
    ...typography.small,
    color: colors.text,
  },
  countryChipTextOn: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  featureStack: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureStepNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureStepNumText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.onPrimary,
  },
  featureStepBody: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  featureStepHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  featureTitle: {
    ...typography.bodyMedium,
    flex: 1,
    color: colors.text,
  },
  featureSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  planCompare: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  planTile: {
    flex: 1,
    minHeight: touchMin + 72,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows,
  },
  planTileFeatured: {
    borderColor: 'rgba(253, 203, 1, 0.5)',
    backgroundColor: colors.primaryMuted,
  },
  planTileOn: {
    borderColor: colors.primaryDark,
    backgroundColor: '#FFFBF0',
  },
  planBadgeRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
    minHeight: 24,
  },
  bestBadge: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  planRadioOn: {
    borderColor: colors.primaryDark,
  },
  planRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryDark,
  },
  planTileLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: 4,
  },
  planTilePrice: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  planTileUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  legal: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkText: {
    ...typography.caption,
    color: colors.primaryDark,
    textDecorationLine: 'underline',
  },
});
