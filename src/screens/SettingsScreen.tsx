import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { APP_DISPLAY_NAME } from '../constants/branding';
import { profilePlaceholderByGender } from '../constants/placeholders';
import { WEBSITE_BASE_URL } from '../constants/subscriptions';
import { MOCK_MAIDS } from '../data/mockMaids';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import type { MaidStackParamList, UserStackParamList } from '../navigation/types';
import { buildDisplayNameFromUserParts } from '../types';
import { colors, radius, shadows, spacing, typography } from '../theme';

type Props = { role: 'maid' | 'user' };

export function SettingsScreen({ role }: Props) {
  const navigation = useNavigation();
  const userStackNav = navigation.getParent<NativeStackNavigationProp<UserStackParamList>>();
  const maidStackNav = navigation.getParent<NativeStackNavigationProp<MaidStackParamList>>();
  const {
    state,
    logout,
    deleteAccount,
    setUserPremiumAutoRenew,
    isUserPremium,
    isMaidPro,
    FREE_CONTACTS_TOTAL,
    updateMaidServiceLocation,
    resetAllLocalData,
  } = useApp();
  const [locUpdating, setLocUpdating] = useState(false);
  const isUser = role === 'user';
  const name =
    role === 'maid'
      ? state.maidProfile?.displayName
      : state.userProfile
        ? buildDisplayNameFromUserParts(state.userProfile)
        : undefined;
  const profileGender = role === 'maid' ? state.maidProfile?.gender ?? 'female' : state.userProfile?.gender ?? 'female';
  const photoUri = role === 'maid' ? state.maidProfile?.photoUri : state.userProfile?.photoUri;
  const premium = isUser && isUserPremium();
  const maidPro = !isUser && isMaidPro();
  const profileType = role === 'maid' ? 'Helper' : 'Family';
  const contactEvents = state.contactEvents
    .slice()
    .sort((a, b) => b.at - a.at)
    .map((e) => {
      const maid =
        MOCK_MAIDS.find((m) => m.id === e.maidId) ??
        state.localPublishedMaids.find((m) => m.id === e.maidId);
      return {
        ...e,
        maidName: maid?.displayName ?? 'Helper',
        maidPhotoUri: maid?.photoUri ?? null,
        maidGender: maid?.gender ?? 'female',
        maid,
      };
    });
  const pendingReviews = contactEvents.filter((e) => e.userRating == null).length;

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You can sign in again with your number.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const open = (path: string) => {
    Linking.openURL(`${WEBSITE_BASE_URL}${path}`).catch(() => {});
  };

  const legalLinks: { path: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { path: '/privacy.html', label: 'Privacy policy', icon: 'shield-checkmark-outline' },
    { path: '/terms.html', label: 'Terms of use', icon: 'document-text-outline' },
    { path: '/support.html', label: 'Support', icon: 'help-circle-outline' },
    { path: '/pricing.html', label: 'Pricing (web)', icon: 'pricetag-outline' },
  ];

  return (
    <Screen scroll flushTop safeAreaTop={false}>
      <View style={styles.pageTop}>
        <View style={styles.profileCard}>
          <View style={styles.profileCardAccent} />
          <View style={styles.profileMainRow}>
            <View style={styles.avatarTile}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatar} />
              ) : (
                <Image source={{ uri: profilePlaceholderByGender(profileGender) }} style={styles.avatar} />
              )}
            </View>
            <View style={styles.profileTextCol}>
              <Text style={styles.profileName} numberOfLines={2}>
                {name || 'Your profile'}
              </Text>
              <Text style={styles.profileRoleLine}>{profileType} account</Text>
              <View style={styles.heroPills}>
                {isUser && (
                  <View style={[styles.pill, premium ? styles.pillGold : styles.pillNeutral]}>
                    <Ionicons
                      name={premium ? 'checkmark-circle' : 'leaf-outline'}
                      size={14}
                      color={premium ? colors.success : colors.warning}
                    />
                    <Text style={styles.pillTextDark}>
                      {premium ? 'Premium' : 'Free plan'}
                    </Text>
                  </View>
                )}
                {!isUser && (
                  <View style={[styles.pill, maidPro ? styles.pillGold : styles.pillNeutral]}>
                    <Ionicons
                      name={maidPro ? 'rocket' : 'ellipse-outline'}
                      size={14}
                      color={maidPro ? colors.success : colors.textSecondary}
                    />
                    <Text style={styles.pillTextDark}>
                      {maidPro ? 'Maid Pro' : 'Standard'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.block}>
            <Text style={styles.blockLabel}>Contact</Text>
            <View style={styles.phoneRow}>
              <View style={styles.iconBubble}>
                <Ionicons name="call-outline" size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.phoneBody}>
                <Text style={styles.phoneNumber}>{state.phone || '—'}</Text>
                <View style={styles.lockedRow}>
                  <Ionicons name="lock-closed-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.phoneLocked}>Fixed to your account · not editable</Text>
                </View>
              </View>
            </View>
          </View>

          {isUser && (
            <Pressable
              style={({ pressed }) => [styles.editCta, pressed && { opacity: 0.92 }]}
              onPress={() => userStackNav?.navigate('EditUserProfile')}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <LinearGradient
                colors={[colors.primary, '#FFE566']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.editCtaGrad}
              >
                <Ionicons name="create-outline" size={22} color={colors.onPrimary} />
                <Text style={styles.editCtaText}>Edit name & photo</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.onPrimary} />
              </LinearGradient>
            </Pressable>
          )}

          {!isUser && (
            <>
              <Pressable
                style={({ pressed }) => [styles.editCta, pressed && { opacity: 0.92 }]}
                onPress={() => maidStackNav?.navigate('EditMaidProfile')}
                accessibilityRole="button"
                accessibilityLabel="Edit name and photo"
              >
                <LinearGradient
                  colors={[colors.primary, '#FFE566']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.editCtaGrad}
                >
                  <Ionicons name="create-outline" size={22} color={colors.onPrimary} />
                  <Text style={styles.editCtaText}>Edit name & photo</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.onPrimary} />
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.locationCta, pressed && { opacity: 0.9 }]}
                onPress={() => {
                  void (async () => {
                    setLocUpdating(true);
                    try {
                      const ok = await updateMaidServiceLocation();
                      if (ok) {
                        Alert.alert(
                          'Service location updated',
                          'Families who allow location will see distance from this spot.'
                        );
                      }
                    } finally {
                      setLocUpdating(false);
                    }
                  })();
                }}
                disabled={locUpdating}
                accessibilityRole="button"
                accessibilityLabel="Update service location for nearby families"
              >
                <View style={styles.iconBubble}>
                  <Ionicons name="navigate-outline" size={20} color={colors.primaryDark} />
                </View>
                <View style={styles.locationCtaBody}>
                  <Text style={styles.locationCtaTitle}>Update service location</Text>
                  <Text style={styles.locationCtaSub}>
                    Use your current spot so nearby families see accurate distance in Discover.
                  </Text>
                </View>
                {locUpdating ? (
                  <ActivityIndicator size="small" color={colors.primaryDark} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
              </Pressable>
              <View style={styles.helperTip}>
                <Ionicons name="information-circle-outline" size={22} color={colors.primaryDark} />
                <Text style={styles.helperTipText}>
                  Your <Text style={styles.helperTipBold}>Home</Text> tab previews rates and services families see in
                  Discover.
                </Text>
              </View>
            </>
          )}
        </View>

        {isUser && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>
                {state.freeContactsUsed}/{FREE_CONTACTS_TOTAL}
              </Text>
              <Text style={styles.statChipLabel}>Free contacts</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipValue}>{contactEvents.length}</Text>
              <Text style={styles.statChipLabel}>Helpers reached</Text>
            </View>
            {premium && state.userPremiumUntil ? (
              <View style={[styles.statChip, styles.statChipWide]}>
                <Text style={styles.statChipValueSm} numberOfLines={1}>
                  {new Date(state.userPremiumUntil).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.statChipLabel}>Premium until</Text>
              </View>
            ) : null}
          </View>
        )}

        {isUser && (
          <View style={styles.panel}>
            <View style={styles.panelTitleRow}>
              <View style={styles.titleBar} />
              <View>
                <Text style={styles.panelTitle}>Subscription</Text>
                {premium && state.userPremiumUntil && (
                  <Text style={styles.panelSub}>
                    Renews while active · turn off auto-renew anytime
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Auto-renew</Text>
                <Text style={styles.switchSub}>
                  Demo toggle — mirrors “cancel renewal” in real billing.
                </Text>
              </View>
              <Switch
                value={state.userPremiumAutoRenew}
                onValueChange={setUserPremiumAutoRenew}
                trackColor={{ false: colors.border, true: colors.primaryMuted }}
                thumbColor={state.userPremiumAutoRenew ? colors.primary : colors.textSecondary}
                accessibilityLabel="Auto-renew subscription"
              />
            </View>
          </View>
        )}

        {isUser && (
          <View style={styles.panel}>
            <View style={styles.panelHeadActivity}>
              <View style={styles.panelTitleRow}>
                <View style={styles.titleBar} />
                <Text style={styles.panelTitle}>Activity</Text>
              </View>
              {pendingReviews > 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{pendingReviews} pending</Text>
                </View>
              )}
            </View>
            {contactEvents.length === 0 ? (
              <Text style={styles.emptyActivity}>
                No contacts yet — browse Find and tap a helper to connect.
              </Text>
            ) : (
              contactEvents.slice(0, 8).map((e) => (
                <View key={e.id} style={styles.activityCard}>
                  <View style={styles.activityDateCol}>
                    <Text style={styles.activityDateNum}>{new Date(e.at).getDate()}</Text>
                    <Text style={styles.activityDateMonth}>
                      {new Date(e.at).toLocaleDateString(undefined, { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.activityCardBody}>
                    <View style={styles.activityTopRow}>
                      {e.maidPhotoUri ? (
                        <Image source={{ uri: e.maidPhotoUri }} style={styles.activityAvatar} />
                      ) : (
                        <Image
                          source={{ uri: profilePlaceholderByGender(e.maidGender) }}
                          style={styles.activityAvatar}
                        />
                      )}
                      <Text style={styles.activityName}>{e.maidName}</Text>
                    </View>
                    <Text style={styles.timelineMeta}>
                      {e.userRating ? `★ ${e.userRating}` : 'Review pending'}
                      {e.userReview ? ` · “${e.userReview}”` : ''}
                    </Text>
                    {!e.userRating && e.maid ? (
                      <Pressable
                        style={styles.rateNowBtn}
                        onPress={() => {
                          const maidForReview = e.maid;
                          if (!maidForReview) return;
                          userStackNav?.navigate('MaidDetail', { maid: maidForReview });
                        }}
                      >
                        <Text style={styles.rateNowBtnText}>Rate now</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))
            )}
            {pendingReviews > 0 && (
              <View style={styles.reviewNudge}>
                <Ionicons name="star-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.reviewNudgeText}>
                  Rate helpers after visits — it helps everyone choose with confidence.
                </Text>
              </View>
            )}
          </View>
        )}

      </View>

      <Text style={styles.sectionHeading}>Support & legal</Text>
      <View style={styles.legalCard}>
        {legalLinks.map((item, i) => (
          <Pressable
            key={item.path}
            style={({ pressed }) => [
              styles.legalRow,
              i < legalLinks.length - 1 && styles.legalRowBorder,
              pressed && { backgroundColor: colors.primaryMuted },
            ]}
            onPress={() => open(item.path)}
          >
            <Ionicons name={item.icon} size={22} color={colors.primaryDark} />
            <Text style={styles.legalLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      <View style={styles.safetyBox}>
        <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.safetyText}>
          {APP_DISPLAY_NAME} connects you with helpers only. Meet safely, verify in person, and agree
          payment directly. We do not process wages for domestic work.
        </Text>
      </View>

      <PrimaryButton title="Sign out" variant="outline" onPress={confirmLogout} style={styles.signOut} />

      <Pressable
        style={styles.deleteBtn}
        onPress={() =>
          Alert.alert(
            'Delete account?',
            `Your profile and data on this device will be removed. To use ${APP_DISPLAY_NAME} again you will need to create a new account with your mobile number.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete account', style: 'destructive', onPress: deleteAccount },
            ]
          )
        }
        accessibilityRole="button"
        accessibilityLabel="Delete account"
      >
        <Text style={styles.deleteText}>Delete my account</Text>
      </Pressable>
      <Pressable
        style={styles.resetAllBtn}
        onPress={() =>
          Alert.alert(
            'Reset all local data?',
            'This clears every local profile, contact history, saved login snapshot, and the “one number / one role” memory on this phone so you can start from zero.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset all', style: 'destructive', onPress: resetAllLocalData },
            ]
          )
        }
      >
        <Text style={styles.resetAllText}>Reset all app data on this phone</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageTop: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadows,
    ...Platform.select({
      ios: {
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  profileCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatarTile: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: '#E8E8E8',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextCol: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  profileName: {
    ...typography.headline,
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  profileRoleLine: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pillGold: {
    backgroundColor: colors.primaryMuted,
    borderColor: 'rgba(253, 203, 1, 0.45)',
  },
  pillNeutral: {
    backgroundColor: '#F3F3F3',
  },
  pillTextDark: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  block: {
    marginBottom: 0,
  },
  blockLabel: {
    ...typography.small,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneBody: { flex: 1, minWidth: 0 },
  phoneNumber: {
    ...typography.bodyMedium,
    fontSize: 18,
    color: colors.text,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneLocked: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editCta: {
    borderRadius: radius.md,
    marginTop: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 1, 0.5)',
  },
  editCtaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  editCtaText: {
    ...typography.bodyMedium,
    color: colors.onPrimary,
    flex: 1,
    fontWeight: '700',
  },
  locationCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationCtaBody: { flex: 1, minWidth: 0 },
  locationCtaTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  locationCtaSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  helperTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#F3F6F9',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helperTipText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  helperTipBold: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statChip: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 100,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statChipWide: {
    flexBasis: '100%',
    minWidth: '100%',
  },
  statChipValue: {
    ...typography.headline,
    fontSize: 20,
    color: colors.primaryDark,
  },
  statChipValueSm: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  statChipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  panelHeadActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  titleBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  panelTitle: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: colors.text,
  },
  panelSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  pendingBadge: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  switchText: { flex: 1 },
  switchTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: 4,
  },
  switchSub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyActivity: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  activityDateCol: {
    width: 44,
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityDateNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  activityDateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  activityCardBody: {
    flex: 1,
    minWidth: 0,
  },
  activityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
  },
  activityName: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  timelineMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  reviewNudge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewNudgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  rateNowBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rateNowBtnText: {
    ...typography.small,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  sectionHeading: {
    ...typography.small,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  legalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  legalRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  legalLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  safetyText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  signOut: {
    marginTop: spacing.xl,
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  deleteText: {
    ...typography.bodyMedium,
    color: '#B00020',
  },
  resetAllBtn: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  resetAllText: {
    ...typography.caption,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
