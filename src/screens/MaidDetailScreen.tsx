import React, { useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { APP_DISPLAY_NAME } from '../constants/branding';
import { formatPrice } from '../constants/localeDisplay';
import { useApp } from '../context/AppContext';
import type { UserStackParamList } from '../navigation/types';
import { SERVICE_LABELS } from '../types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<UserStackParamList, 'MaidDetail'>;

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '');
}

export function MaidDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { maid } = route.params;
  const {
    canContactMaid,
    maidCanReceiveContact,
    registerContact,
    isUserPremium,
    purchaseUserPremium,
    FREE_CONTACTS_TOTAL,
    state,
  } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);

  const tryContact = () => {
    if (!maidCanReceiveContact(maid.id)) {
      Alert.alert(
        'Helper unavailable',
        'This helper has reached their free lead limit for this month. Try another helper, or they can upgrade to Maid Pro in the app.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (!canContactMaid()) {
      Alert.alert(
        'Subscribe to continue',
        `You used all ${FREE_CONTACTS_TOTAL} free contacts on this account. Subscribe for unlimited contacts while your plan is active.`,
        [
          {
            text: 'View plans',
            onPress: () => navigation.navigate('UserTabs', { screen: 'Premium' }),
          },
          { text: 'Not now', style: 'cancel' },
        ]
      );
      return;
    }
    const ok = registerContact(maid.id);
    if (ok) setSheetOpen(true);
  };

  const call = () => {
    const n = digitsOnly(maid.phone);
    Linking.openURL(`tel:${n}`);
  };

  const whatsapp = () => {
    const n = digitsOnly(maid.phone);
    Linking.openURL(`https://wa.me/${n}`);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          {maid.photoUri ? (
            <Image source={{ uri: maid.photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoLetter}>{maid.displayName.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.name}>{maid.displayName}</Text>
          <Text style={styles.meta}>
            {maid.gender === 'male' ? 'Male' : 'Female'} · {maid.distanceLabel}
            {maid.reviewCount === 0
              ? ` · New on ${APP_DISPLAY_NAME}`
              : ` · ★ ${maid.ratingAvg.toFixed(1)} · ${maid.reviewCount} reviews`}
          </Text>
        </View>

        <Text style={styles.section}>Rates</Text>
        <View style={styles.rateTiles}>
          <View style={styles.rateTile}>
            <Text style={styles.rateTileTitle}>1 hour</Text>
            <Text style={styles.rateTilePrice}>{formatPrice(maid.rates.h1)}</Text>
            <Text style={styles.rateTileOff}>Listed rate</Text>
          </View>
          <View style={styles.rateTile}>
            <Text style={styles.rateTileTitle}>1.5 hours</Text>
            <Text style={styles.rateTilePrice}>{formatPrice(Math.round(maid.rates.h1 * 1.5))}</Text>
            <Text style={styles.rateTileOff}>Best value</Text>
          </View>
          <View style={styles.rateTile}>
            <Text style={styles.rateTileTitle}>2 hours</Text>
            <Text style={styles.rateTilePrice}>{formatPrice(maid.rates.h2)}</Text>
            <Text style={styles.rateTileOff}>Pack discount</Text>
          </View>
        </View>

        <View style={styles.promo}>
          <Text style={styles.promoTag}>Premium</Text>
          <Text style={styles.promoTitle}>Unlimited contacts for your family</Text>
          <Text style={styles.promoBody}>
            Subscribe for unlimited phone and WhatsApp outreach while your plan is active.
          </Text>
          <Pressable
            style={styles.promoBtn}
            onPress={() => navigation.navigate('UserTabs', { screen: 'Premium' })}
          >
            <Text style={styles.promoBtnText}>View plans</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Services</Text>
        <View style={styles.chips}>
          {maid.services.map((s) => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{SERVICE_LABELS[s]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Reviews</Text>
        {maid.reviews.length === 0 ? (
          <View style={styles.reviewsEmpty}>
            <Text style={styles.empty}>No reviews yet</Text>
            <Text style={styles.emptySub}>
              This helper may be new in your area. Always confirm skills and references in person.
            </Text>
          </View>
        ) : (
          maid.reviews.map((r) => (
            <View key={r.id} style={styles.review}>
              <View style={styles.reviewTop}>
                {r.authorPhotoUri ? (
                  <Image source={{ uri: r.authorPhotoUri }} style={styles.reviewAvatar} />
                ) : (
                  <View style={styles.reviewAvatarPlaceholder}>
                    <Text style={styles.reviewAvatarLetter}>{r.author.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.reviewHeadCol}>
                  <Text style={styles.reviewHead}>
                    {r.author} · ★ {r.rating}
                  </Text>
                  <Text style={styles.reviewMeta}>Family review</Text>
                </View>
              </View>
              <Text style={styles.reviewBody}>{r.comment}</Text>
            </View>
          ))
        )}

        {!isUserPremium() && (
          <Text style={styles.disclaimer}>
            Free contacts used: {state.freeContactsUsed} / {FREE_CONTACTS_TOTAL} (lifetime on this
            account).
          </Text>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.md) },
        ]}
      >
        <PrimaryButton title="Contact" onPress={tryContact} />
        <Pressable
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('UserTabs', { screen: 'Find' });
          }}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <Modal visible={sheetOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Contact {maid.displayName}</Text>
            <Text style={styles.sheetSub}>
              No booking here — call or message directly. Stay safe and agree timing & pay offline.
            </Text>
            <PrimaryButton title="Call" onPress={call} style={styles.sheetBtn} />
            <PrimaryButton title="WhatsApp" variant="secondary" onPress={whatsapp} />
            <Pressable
              onPress={() => setSheetOpen(false)}
              style={styles.close}
              accessibilityLabel="Close"
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
            <Pressable
              onPress={() => purchaseUserPremium('monthly')}
              style={styles.mini}
            >
              <Text style={styles.miniText}>Demo: activate Premium (monthly)</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 120 },
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  photoLetter: { ...typography.title, color: colors.primaryDark },
  name: { ...typography.headline, color: colors.text },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  section: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rateRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  pricingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  rateLabel: { ...typography.body, color: colors.textSecondary },
  rateVal: { ...typography.bodyMedium, color: colors.text },
  rateTiles: {
    flexDirection: 'row',
    gap: 10,
  },
  rateTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  rateTileTitle: {
    ...typography.small,
    color: colors.text,
  },
  rateTilePrice: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: 4,
  },
  rateTileOff: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
    marginTop: 6,
  },
  promo: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 120,
    backgroundColor: colors.primaryDark,
  },
  promoTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    zIndex: 2,
  },
  promoTitle: {
    ...typography.bodyMedium,
    color: colors.onDark,
    marginTop: spacing.sm,
    zIndex: 2,
  },
  promoBody: {
    ...typography.caption,
    color: colors.onDarkMuted,
    marginTop: 2,
    zIndex: 2,
  },
  promoBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    zIndex: 2,
  },
  promoBtnText: {
    ...typography.small,
    color: colors.primaryDark,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  chipText: { fontSize: 13, color: colors.text },
  reviewsEmpty: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: { ...typography.bodyMedium, color: colors.text },
  emptySub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  review: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
  },
  reviewAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarLetter: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  reviewHeadCol: { flex: 1, minWidth: 0 },
  reviewHead: { ...typography.small, color: colors.text, fontWeight: '600' },
  reviewMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  reviewBody: { ...typography.caption, color: colors.textSecondary, lineHeight: 20 },
  disclaimer: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  back: {
    alignItems: 'center',
    marginTop: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  backText: { ...typography.caption, color: colors.primaryDark },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetTitle: { ...typography.headline, color: colors.text, marginBottom: spacing.xs },
  sheetSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sheetBtn: { marginBottom: spacing.sm },
  close: { alignItems: 'center', marginTop: spacing.md },
  closeText: { ...typography.caption, color: colors.primaryDark },
  mini: { marginTop: spacing.sm, alignItems: 'center' },
  miniText: { fontSize: 12, color: colors.textSecondary },
});
