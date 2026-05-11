import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatPrice } from '../constants/localeDisplay';
import { MAID_PLANS, WEBSITE_BASE_URL } from '../constants/subscriptions';
import { GlassCard } from '../components/GlassCard';
import { MainBanner } from '../components/MainBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import type { PlanPeriod } from '../context/AppContext';
import { colors, radius, spacing, typography } from '../theme';

export function MaidEarnScreen() {
  const { isMaidPro, purchaseMaidPro, state, FREE_LEADS_PER_MONTH, getLeadCount } = useApp();
  const pro = isMaidPro();
  const [selected, setSelected] = useState<PlanPeriod>('yearly');
  const maidId = state.maidProfile?.id;
  const used = maidId ? getLeadCount(maidId) : 0;

  const openTerms = () => {
    Linking.openURL(`${WEBSITE_BASE_URL}/terms.html`).catch(() => {});
  };

  const yearlySave = MAID_PLANS.yearly.discountPercent;

  return (
    <Screen scroll>
      <MainBanner role="maid" />
      <View>
        <Text style={styles.title}>Maid Pro</Text>
        <Text style={styles.sub}>
          {FREE_LEADS_PER_MONTH} free lead contacts per month from families. After that, subscribe
          to keep receiving new leads and stay visible.
        </Text>

        <GlassCard style={styles.stats}>
          <Text style={styles.statsTitle}>This month</Text>
          <Text style={styles.statsLine}>
            Leads used: {used} / {FREE_LEADS_PER_MONTH} (free)
          </Text>
          {pro && (
            <Text style={styles.proActive}>
              Pro active until{' '}
              {state.maidProUntil ? new Date(state.maidProUntil).toLocaleDateString() : '—'}
            </Text>
          )}
        </GlassCard>

        <GlassCard style={styles.glassPad}>
          <Text style={styles.planLabel}>Choose billing</Text>
          <Pressable
            onPress={() => setSelected('monthly')}
            style={[styles.planRow, selected === 'monthly' && styles.planRowOn]}
          >
            <View>
              <Text style={styles.planName}>Monthly</Text>
              <Text style={styles.planHint}>Start small</Text>
            </View>
            <Text style={styles.planPrice}>
              {formatPrice(MAID_PLANS.monthly.priceInr, state.pricingCountry)}/mo
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSelected('yearly')}
            style={[styles.planRow, selected === 'yearly' && styles.planRowOn]}
          >
            <View>
              <Text style={styles.planName}>Yearly</Text>
              <Text style={styles.planHint}>Save ~{yearlySave}% vs 12× monthly</Text>
            </View>
            <Text style={styles.planPrice}>
              {formatPrice(MAID_PLANS.yearly.priceInr, state.pricingCountry)}/yr
            </Text>
          </Pressable>
          <Text style={styles.legal}>
            Product IDs: {MAID_PLANS.monthly.id}, {MAID_PLANS.yearly.id} (configure in App Store
            Connect & Play Console).
          </Text>
        </GlassCard>

        <PrimaryButton
          title={
            pro
              ? `Extend (${selected === 'yearly' ? 'Yearly' : 'Monthly'}) — demo`
              : `Subscribe Maid Pro — ${formatPrice(
                  selected === 'yearly'
                    ? MAID_PLANS.yearly.priceInr
                    : MAID_PLANS.monthly.priceInr,
                  state.pricingCountry
                )}`
          }
          onPress={() => purchaseMaidPro(selected)}
        />
        <Pressable onPress={openTerms} style={styles.linkBtn}>
          <Text style={styles.linkText}>Terms of use (website)</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  stats: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statsTitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statsLine: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  proActive: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.sm,
  },
  glassPad: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  planLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(17,50,74,0.12)',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  planRowOn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(11,111,164,0.12)',
  },
  planName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  planHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  planPrice: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  legal: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
