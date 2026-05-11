import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppNameMark } from '../components/AppNameMark';
import { MainBanner } from '../components/MainBanner';
import { APP_DISPLAY_NAME } from '../constants/branding';
import { formatPrice } from '../constants/localeDisplay';
import { helperProfileImageSource } from '../constants/placeholders';
import { useApp } from '../context/AppContext';
import { SERVICE_LABELS } from '../types';
import { colors, radius, shadows, spacing, touchMin, typography } from '../theme';

const HOME_HERO_MAID = require('../../assets/home-hero-maid.jpg');

export function MaidHomeScreen() {
  const { state, isMaidPro, getLeadCount, FREE_LEADS_PER_MONTH } = useApp();
  const m = state.maidProfile;

  if (!m) {
    return (
      <View style={[styles.center, styles.pageBg]}>
        <View style={styles.emptyCard}>
          <AppNameMark variant="onLight" size="title" style={styles.emptyBrand} />
          <Text style={styles.emptyTitle}>Finish your profile</Text>
          <Text style={styles.body}>
            Complete setup so families can discover you on {APP_DISPLAY_NAME}.
          </Text>
        </View>
      </View>
    );
  }

  const pro = isMaidPro();
  const used = getLeadCount(m.id);
  const leadPct = Math.min(100, Math.round((used / FREE_LEADS_PER_MONTH) * 100));

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.root}>
      <View style={styles.introCard}>
        <View style={styles.introStripe} />
        <View style={styles.introSplit}>
          <View style={styles.introMascotBubble}>
            <Image
              source={HOME_HERO_MAID}
              style={styles.introMascotImage}
              resizeMode="cover"
              accessibilityRole="image"
              accessibilityLabel="Find My Maid mascot, a cheerful helper in yellow gloves"
            />
          </View>
          <View style={styles.introBody}>
            <Text style={styles.introEyebrow}>Home</Text>
            <AppNameMark variant="onLight" size="caption" />
            <Text style={styles.introLead}>
              How families see you in search — keep rates and services up to date here.
            </Text>
          </View>
        </View>
      </View>

      <MainBanner role="maid" showBrandRow={false} />

      <Text style={styles.sectionKicker}>Overview</Text>
      {pro ? (
        <View style={styles.bentoRow}>
          <View style={[styles.bentoCell, styles.bentoWide, styles.bentoPro]}>
            <Ionicons name="rocket" size={26} color={colors.success} />
            <View style={styles.bentoProText}>
              <Text style={styles.bentoTitle}>Maid Pro</Text>
              <Text style={styles.bentoSub}>Unlimited leads this period</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.bentoRow}>
          <View style={[styles.bentoCell, styles.bentoStat]}>
            <Text style={styles.bentoStatNum}>{used}</Text>
            <Text style={styles.bentoStatLabel}>Leads used</Text>
          </View>
          <View style={[styles.bentoCell, styles.bentoStat]}>
            <Text style={styles.bentoStatNum}>{FREE_LEADS_PER_MONTH - used}</Text>
            <Text style={styles.bentoStatLabel}>Left free</Text>
          </View>
        </View>
      )}

      {!pro && (
        <View style={styles.leadMeter}>
          <View style={styles.leadMeterBar}>
            <View style={[styles.leadMeterFill, { width: `${leadPct}%` }]} />
          </View>
          <Text style={styles.leadMeterHint}>
            Need more visibility? Open the Boost tab before you hit the cap.
          </Text>
        </View>
      )}

      <Text style={styles.sectionKicker}>Your listing</Text>
      <View style={styles.listingCard}>
        <View style={styles.listingHeader}>
          <View style={styles.avatar}>
            <Image source={helperProfileImageSource(m.photoUri, m.gender)} style={styles.avatarImg} />
          </View>
          <View style={styles.listingHeaderText}>
            <Text style={styles.name}>{m.displayName}</Text>
            <View style={styles.verifiedRow}>
              <Ionicons
                name={m.verified ? 'checkmark-circle' : 'time-outline'}
                size={18}
                color={m.verified ? colors.success : colors.warning}
              />
              <Text style={styles.metaLine}>
                {m.gender === 'male' ? 'Male' : 'Female'} · {m.age} yrs ·{' '}
                {m.verified ? 'Verified' : 'Pending review'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rateGrid}>
          <View style={styles.rateTile}>
            <Text style={styles.rateTileLabel}>30 min</Text>
            <Text style={styles.rateTileValue}>{formatPrice(m.rates.m30, state.pricingCountry)}</Text>
          </View>
          <View style={styles.rateTile}>
            <Text style={styles.rateTileLabel}>1 hour</Text>
            <Text style={styles.rateTileValue}>{formatPrice(m.rates.h1, state.pricingCountry)}</Text>
          </View>
          <View style={styles.rateTile}>
            <Text style={styles.rateTileLabel}>2 hours</Text>
            <Text style={styles.rateTileValue}>{formatPrice(m.rates.h2, state.pricingCountry)}</Text>
          </View>
          <View style={styles.rateTile}>
            <Text style={styles.rateTileLabel}>24 hours</Text>
            <Text style={styles.rateTileValue}>{formatPrice(m.rates.h24, state.pricingCountry)}</Text>
          </View>
        </View>

        <Text style={styles.detailLabel}>Services</Text>
        <View style={styles.chips}>
          {m.services.map((s) => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{SERVICE_LABELS[s]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.detailLabel}>Phone on profile</Text>
        <Text style={styles.phoneBig}>{m.phone}</Text>
      </View>

      <Text style={styles.footNote}>
        Edit your name and photo in <Text style={styles.footNoteBold}>My Profile</Text>.{' '}
        {APP_DISPLAY_NAME} updates your discovery card when you save changes.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECEFF3' },
  pageBg: { backgroundColor: '#ECEFF3' },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    maxWidth: 360,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows,
  },
  emptyBrand: { marginBottom: spacing.md },
  emptyTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 0,
    paddingTop: 5,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows,
  },
  introStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 5,
    backgroundColor: colors.primaryDark,
    zIndex: 2,
  },
  introSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  introMascotBubble: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  introMascotImage: {
    width: '100%',
    height: '100%',
  },
  introBody: {
    flex: 1,
    minWidth: 0,
    paddingVertical: spacing.xs,
  },
  introEyebrow: {
    ...typography.small,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.accentDark,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  introLead: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 360,
  },
  sectionKicker: {
    ...typography.small,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bentoCell: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: touchMin + 28,
    justifyContent: 'center',
  },
  bentoWide: { flex: 1 },
  bentoStat: {
    flex: 1,
    alignItems: 'center',
  },
  bentoPro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(27, 122, 92, 0.08)',
    borderColor: 'rgba(27, 122, 92, 0.28)',
  },
  bentoProText: {
    flex: 1,
    minWidth: 0,
  },
  bentoTitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: colors.text,
    marginBottom: 2,
  },
  bentoSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bentoStatNum: {
    ...typography.headline,
    fontSize: 26,
    color: colors.primaryDark,
  },
  bentoStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  leadMeter: {
    marginBottom: spacing.md,
  },
  leadMeterBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  leadMeterFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
    maxWidth: '100%',
  },
  leadMeterHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  listingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows,
  },
  listingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarLetter: { ...typography.headline, fontSize: 28, color: colors.primaryDark },
  listingHeaderText: { flex: 1, minWidth: 0 },
  name: { ...typography.headline, fontSize: 22, color: colors.text },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaLine: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  rateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  rateTile: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 140,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rateTileLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rateTileValue: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  detailLabel: {
    ...typography.small,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  chip: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
  phoneBig: {
    ...typography.bodyMedium,
    fontSize: 18,
    color: colors.text,
  },
  footNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    lineHeight: 20,
  },
  footNoteBold: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
