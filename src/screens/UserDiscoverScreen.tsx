import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { AppNameMark } from '../components/AppNameMark';
import { MainBanner } from '../components/MainBanner';
import { API_SYNC_ENABLED } from '../constants/api';
import { APP_DISPLAY_NAME } from '../constants/branding';
import { SHOW_SAMPLE_NEARBY_LISTINGS } from '../constants/discovery';
import { formatPrice } from '../constants/localeDisplay';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { MOCK_CENTER, MOCK_MAIDS, withDistances } from '../data/mockMaids';
import type { UserStackParamList } from '../navigation/types';
import { fetchRemoteMaids } from '../services/backend';
import { SERVICE_LABELS } from '../types';
import type { PublicMaid } from '../types';
import {
  colors,
  hitSlopComfort,
  radius,
  sectionSpacing,
  shadows,
  spacing,
  touchMin,
  typography,
} from '../theme';

type SortKey = 'distance' | 'rating' | 'price_low' | 'price_high';
type GenderFilter = 'all' | 'male' | 'female';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'distance', label: 'Nearest first' },
  { key: 'rating', label: 'Rating' },
  { key: 'price_low', label: 'Price · low' },
  { key: 'price_high', label: 'Price · high' },
];

/** Cheerful maid mascot — black background matches artwork for seamless crop. */
const HOME_HERO_MAID = require('../../assets/home-hero-maid.png');

/** Location strip below the nav header (not inside the header bar). */
function CurrentLocationCard({
  loading,
  loc,
  addressLabel,
}: {
  loading: boolean;
  loc: { lat: number; lng: number } | null;
  addressLabel: string | null;
}) {
  const line = loading
    ? 'Getting your current location…'
    : !loc
      ? 'Location is off — turn it on in settings to see distances.'
      : addressLabel ?? 'Looking up your address…';
  const live = !!(loc && addressLabel && !loading);

  return (
    <View
      style={styles.locationCard}
      accessibilityRole="summary"
      accessibilityLabel={`Current location. ${line}`}
    >
      <View style={styles.locationPin}>
        <Ionicons name="location-sharp" size={22} color={colors.primaryDark} />
      </View>
      <View style={styles.locationCardBody}>
        <View style={styles.locationCardTop}>
          <Text style={styles.locationCardLabel}>Current location</Text>
          {live && (
            <View style={styles.liveBadge}>
              <View style={styles.liveBadgeDot} />
              <Text style={styles.liveBadgeText}>Live</Text>
            </View>
          )}
          {loading && <ActivityIndicator size="small" color={colors.primaryDark} />}
        </View>
        <Text style={styles.locationCardAddress} numberOfLines={3}>
          {line}
        </Text>
      </View>
    </View>
  );
}

function DiscoverFeedEmpty({
  loading,
  refreshing,
  loc,
  hasActiveFilters,
  onClearFilters,
  onRetryList,
}: {
  loading: boolean;
  refreshing: boolean;
  loc: { lat: number; lng: number } | null;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onRetryList: () => void;
}) {
  if (loading && !refreshing) {
    return (
      <View style={styles.emptyLoading} accessible accessibilityLabel="Loading listings">
        <ActivityIndicator size="large" color={colors.primaryDark} />
        <Text style={styles.emptyLoadingText}>Loading listings…</Text>
      </View>
    );
  }
  if (hasActiveFilters) {
    return (
      <EmptyState
        icon="funnel-outline"
        title="No matches"
        description="Nothing fits those filters. Clear them or try different search words."
        primaryAction={{ label: 'Clear filters', onPress: onClearFilters }}
      />
    );
  }
  if (!loc) {
    return (
      <EmptyState
        icon="location-outline"
        title="Location is off"
        description={`${APP_DISPLAY_NAME} works worldwide. Allow location so we can sort by distance as helpers join your area.`}
        primaryAction={{ label: 'Try location again', onPress: onRetryList }}
      />
    );
  }
  return (
    <EmptyState
      icon="earth-outline"
      title="No helpers here yet"
      description="There are no listings in your area right now. We’re growing globally — refresh, or check back as more helpers sign up near you."
      primaryAction={{ label: 'Refresh', onPress: onRetryList }}
    />
  );
}

export function UserDiscoverScreen() {
  const { width: winW } = useWindowDimensions();
  const navigation = useNavigation();
  const stackNav = navigation.getParent<NativeStackNavigationProp<UserStackParamList>>();
  const { state } = useApp();
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [addressLabel, setAddressLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('distance');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [remoteMaids, setRemoteMaids] = useState<PublicMaid[]>([]);
  const [remoteReady, setRemoteReady] = useState(false);

  const refreshRemoteMaids = useCallback(async () => {
    if (!API_SYNC_ENABLED) return;
    const params =
      loc != null ? { lat: loc.lat, lng: loc.lng, radiusKm: 500 } : undefined;
    const rows = await fetchRemoteMaids(params);
    setRemoteReady(true);
    if (rows !== null) setRemoteMaids(rows);
  }, [loc]);

  const confirmLocationFetch = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        Alert.alert(
          'Use your location?',
          `${APP_DISPLAY_NAME} can fetch your current location to show accurate nearby helpers and distances.`,
          [
            { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Allow', onPress: () => resolve(true) },
          ]
        );
      }),
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const proceed = await confirmLocationFetch();
      if (!proceed) {
        setLoc(null);
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoc(null);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setLoc(MOCK_CENTER);
    } finally {
      setLoading(false);
    }
  }, [confirmLocationFetch]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      void refreshRemoteMaids();
    }, [refreshRemoteMaids])
  );

  useEffect(() => {
    if (API_SYNC_ENABLED && loc) {
      void refreshRemoteMaids();
    }
  }, [loc?.lat, loc?.lng, refreshRemoteMaids]);

  useEffect(() => {
    if (!loc) {
      setAddressLabel(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await Location.reverseGeocodeAsync({
          latitude: loc.lat,
          longitude: loc.lng,
        });
        if (cancelled || !rows[0]) return;
        const g = rows[0];
        const parts = [g.name, g.street, g.district, g.city, g.region, g.subregion]
          .filter(Boolean)
          .map((s) => String(s).trim());
        const deduped = [...new Set(parts)];
        setAddressLabel(
          deduped.slice(0, 4).join(', ') ||
            `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`
        );
      } catch {
        if (!cancelled) {
          setAddressLabel(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loc]);

  const mergedMaids = useMemo(() => {
    const localOnly = state.localPublishedMaids;
    const mergeLegacy = () => {
      if (SHOW_SAMPLE_NEARBY_LISTINGS) {
        const ids = new Set(MOCK_MAIDS.map((m) => m.id));
        const extras = localOnly.filter((m) => !ids.has(m.id));
        return [...MOCK_MAIDS, ...extras];
      }
      return [...localOnly];
    };
    if (!API_SYNC_ENABLED || !remoteReady) {
      return mergeLegacy();
    }
    const ids = new Set<string>();
    const out: PublicMaid[] = [];
    if (SHOW_SAMPLE_NEARBY_LISTINGS) {
      for (const m of MOCK_MAIDS) {
        ids.add(m.id);
        out.push(m);
      }
    }
    for (const m of remoteMaids) {
      if (!ids.has(m.id)) {
        ids.add(m.id);
        out.push(m);
      }
    }
    for (const m of localOnly) {
      if (!ids.has(m.id)) {
        ids.add(m.id);
        out.push(m);
      }
    }
    return out;
  }, [remoteMaids, remoteReady, state.localPublishedMaids]);

  const baseList = useMemo(() => {
    // Always list every profile; lead limits only block "Contact" on the detail screen.
    return withDistances(mergedMaids, loc);
  }, [mergedMaids, loc]);

  const list = useMemo(() => {
    let rows = [...baseList];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter((m) => {
        if (m.displayName.toLowerCase().includes(q)) return true;
        return m.services.some((s) => SERVICE_LABELS[s].toLowerCase().includes(q));
      });
    }
    if (genderFilter !== 'all') {
      rows = rows.filter((m) => m.gender === genderFilter);
    }
    switch (sortKey) {
      case 'distance':
        rows.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        break;
      case 'rating':
        rows.sort((a, b) => b.ratingAvg - a.ratingAvg);
        break;
      case 'price_low':
        rows.sort((a, b) => a.rates.h1 - b.rates.h1);
        break;
      case 'price_high':
        rows.sort((a, b) => b.rates.h1 - a.rates.h1);
        break;
      default:
        break;
    }
    return rows;
  }, [baseList, searchQuery, genderFilter, sortKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    await refreshRemoteMaids();
    setRefreshing(false);
  };

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'Sort';

  const hasActiveFilters = useMemo(
    () =>
      searchQuery.trim().length > 0 ||
      genderFilter !== 'all' ||
      sortKey !== 'distance',
    [searchQuery, genderFilter, sortKey]
  );

  const clearDiscoverFilters = useCallback(() => {
    setSearchQuery('');
    setGenderFilter('all');
    setSortKey('distance');
    setSortMenuOpen(false);
  }, []);

  return (
    <View
      style={[
        styles.page,
        winW >= 768 && { maxWidth: 640, alignSelf: 'center', width: '100%' },
      ]}
    >
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={[styles.listContent, list.length === 0 && styles.listContentEmpty]}
        ListEmptyComponent={
          <DiscoverFeedEmpty
            loading={loading}
            refreshing={refreshing}
            loc={loc}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearDiscoverFilters}
            onRetryList={() => {
              void onRefresh();
            }}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.homeIntro}>
              <View style={styles.homeIntroStripe} />
              <View style={styles.homeIntroSplit}>
                <View style={styles.homeIntroVisual}>
                  <Image
                    source={HOME_HERO_MAID}
                    style={styles.homeIntroImage}
                    resizeMode="contain"
                    accessibilityRole="image"
                    accessibilityLabel="Find My Maid mascot, a cheerful helper in yellow gloves"
                  />
                </View>
                <View style={styles.homeIntroBody}>
                  <AppNameMark variant="onLight" size="title" style={styles.homeIntroMark} />
                  <Text style={styles.homeIntroTagline}>
                    Discover domestic helpers near you. Open a profile for rates and contact — no
                    in-app booking.
                  </Text>
                </View>
              </View>
            </View>

            <MainBanner role="user" showBrandRow={false} />

            {!API_SYNC_ENABLED && state.localPublishedMaids.length > 0 && (
              <View style={styles.deviceScopeHint}>
                <Ionicons name="phone-portrait-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.deviceScopeHintText}>
                  Helpers who finish signup on <Text style={styles.deviceScopeBold}>this phone</Text> appear here
                  when you use the family account on the same device. Set{' '}
                  <Text style={styles.deviceScopeBold}>EXPO_PUBLIC_API_URL</Text> to sync across devices.
                </Text>
              </View>
            )}
            {API_SYNC_ENABLED && (
              <View style={styles.deviceScopeHint}>
                <Ionicons name="cloud-done-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.deviceScopeHintText}>
                  Listings load from your hosted API. Pull to refresh after helpers publish their profile.
                </Text>
              </View>
            )}

            <CurrentLocationCard loading={loading} loc={loc} addressLabel={addressLabel} />

            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.headline}>Nearby helpers</Text>
                <Text style={styles.sub}>
                  {list.length === 1
                    ? '1 person matches your filters'
                    : `${list.length} people match your filters`}
                </Text>
              </View>
            </View>
            <Text style={styles.resultsHint}>
              Tap a card for full details. You arrange timing and payment directly with the helper —
              outside {APP_DISPLAY_NAME}.
            </Text>

            <View style={styles.sectionSurface}>
              <Text style={styles.sectionEyebrow}>Refine</Text>
              <Text style={styles.sectionTitle}>Search &amp; sort</Text>
              <Text style={styles.sectionHint}>
                Search by skill or name. Optional gender filter and sort. Nearest first is the default.
              </Text>

              <Text style={styles.filterHeading}>Search</Text>
              <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Cooking, cleaning, or a name…"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.searchInput}
                  accessibilityLabel="Search by skill or name"
                  accessibilityHint="Filters the list as you type"
                  returnKeyType="search"
                  clearButtonMode="never"
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    accessibilityLabel="Clear search"
                    accessibilityHint="Removes search text"
                    hitSlop={hitSlopComfort}
                    style={styles.iconHit}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>

              <View style={styles.inCardDivider} />

              <View style={styles.filterBlock}>
                <Text style={styles.filterHeading}>Gender</Text>
                <View
                  style={styles.filterRow}
                  accessibilityRole="radiogroup"
                  accessibilityLabel="Filter by gender"
                >
                  {(['all', 'female', 'male'] as const).map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setGenderFilter(g)}
                      style={[styles.filterChip, genderFilter === g && styles.filterChipOn]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: genderFilter === g }}
                      accessibilityLabel={g === 'all' ? 'All genders' : g === 'female' ? 'Female' : 'Male'}
                    >
                      <Text style={[styles.filterChipText, genderFilter === g && styles.filterChipTextOn]}>
                        {g === 'all' ? 'All' : g === 'female' ? 'Female' : 'Male'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={[styles.filterBlock, styles.filterBlockLast]}>
                <Text style={styles.filterHeading}>Sort order</Text>
                <Pressable
                  style={styles.sortTrigger}
                  onPress={() => setSortMenuOpen(!sortMenuOpen)}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort list, currently ${sortLabel}`}
                  accessibilityHint="Opens sort options"
                  accessibilityState={{ expanded: sortMenuOpen }}
                >
                  <Text style={styles.sortTriggerText}>{sortLabel}</Text>
                  <Ionicons
                    name={sortMenuOpen ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={colors.primaryDark}
                  />
                </Pressable>
                {sortMenuOpen && (
                  <View
                    style={styles.sortMenu}
                    accessibilityRole="menu"
                    accessibilityLabel="Sort options"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <Pressable
                        key={o.key}
                        style={[styles.sortRow, sortKey === o.key && styles.sortRowOn]}
                        onPress={() => {
                          setSortKey(o.key);
                          setSortMenuOpen(false);
                        }}
                        accessibilityRole="menuitem"
                        accessibilityLabel={o.label}
                        accessibilityState={{ selected: sortKey === o.key }}
                      >
                        <Text style={styles.sortRowText}>{o.label}</Text>
                        {sortKey === o.key && (
                          <Ionicons name="checkmark" size={18} color={colors.primaryDark} />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => stackNav?.navigate('MaidDetail', { maid: item })}
            accessibilityRole="button"
            accessibilityLabel={`${item.displayName}, ${item.distanceLabel}`}
            accessibilityHint="Opens profile, rates, and contact options"
          >
            <View style={styles.cardAccent} />
            <View style={styles.cardInner}>
              <View style={styles.avatar}>
                {item.photoUri ? (
                  <Image source={{ uri: item.photoUri }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarLetter}>
                    {item.displayName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.displayName}
                  </Text>
                  <View style={styles.distancePill}>
                    <Ionicons name="navigate-outline" size={12} color={colors.primaryDark} />
                    <Text style={styles.distancePillText}>{item.distanceLabel}</Text>
                  </View>
                </View>
                <View style={styles.nameRow}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={colors.accentDark} />
                    <Text style={styles.meta}>
                      {item.ratingAvg.toFixed(1)} ({item.reviewCount} reviews)
                    </Text>
                  </View>
                  <Ionicons
                    name={item.gender === 'male' ? 'man-outline' : 'woman-outline'}
                    size={18}
                    color={colors.textSecondary}
                    accessibilityLabel={item.gender === 'male' ? 'Male' : 'Female'}
                  />
                </View>
                <Text style={styles.rates} numberOfLines={1}>
                  From {formatPrice(item.rates.h1)} / hr · 30m {formatPrice(item.rates.m30)} · 2h{' '}
                  {formatPrice(item.rates.h2)}
                </Text>
                <View style={styles.tags}>
                  {item.services.slice(0, 3).map((s) => (
                    <View key={s} style={styles.tag}>
                      <Text style={styles.tagText}>{SERVICE_LABELS[s]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ECEFF3',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  homeIntro: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 0,
    paddingTop: 5,
    marginBottom: sectionSpacing.section,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows,
  },
  homeIntroStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 5,
    backgroundColor: colors.primary,
    zIndex: 2,
  },
  homeIntroSplit: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 200,
    paddingTop: 5,
  },
  homeIntroVisual: {
    width: '42%',
    maxWidth: 168,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
  },
  homeIntroImage: {
    width: '100%',
    height: 212,
  },
  homeIntroBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: '#FFFEF9',
  },
  homeIntroMark: {
    marginBottom: spacing.sm,
  },
  homeIntroTagline: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    maxWidth: 400,
  },
  deviceScopeHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 1, 0.45)',
    padding: spacing.md,
    marginBottom: sectionSpacing.group,
  },
  deviceScopeHintText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  deviceScopeBold: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  resultsHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  sectionSurface: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: sectionSpacing.section,
    ...shadows,
  },
  sectionEyebrow: {
    ...typography.small,
    fontWeight: '800',
    color: colors.accentDark,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inCardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: sectionSpacing.group,
  },
  sectionHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: sectionSpacing.section,
    ...shadows,
  },
  locationPin: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCardBody: {
    flex: 1,
    minWidth: 0,
  },
  locationCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  locationCardLabel: {
    ...typography.small,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 1, 0.5)',
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.8,
  },
  locationCardAddress: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  iconHit: {
    minWidth: touchMin,
    minHeight: touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 4,
    minHeight: 40,
  },
  locHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  filterBlock: { marginBottom: sectionSpacing.group, marginTop: 0 },
  filterBlockLast: { marginBottom: 0 },
  filterHeading: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    minHeight: touchMin,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  filterChipOn: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primaryMuted,
  },
  filterChipText: { ...typography.small, color: colors.textSecondary },
  filterChipTextOn: { color: colors.primaryDark, fontWeight: '600' },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchMin,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  sortTriggerText: { ...typography.body, color: colors.text },
  sortMenu: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchMin,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sortRowOn: { backgroundColor: colors.primaryMuted },
  sortRowText: { ...typography.body, color: colors.text },
  headline: {
    ...typography.headline,
    fontSize: 22,
    color: colors.text,
    marginBottom: 2,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: 4,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyLoading: {
    paddingVertical: spacing.xxl * 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyLoadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
    ...shadows,
  },
  cardAccent: {
    width: 5,
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.md,
    minWidth: 0,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarLetter: {
    ...typography.headline,
    color: colors.primaryDark,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 4,
  },
  name: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: colors.text,
    flex: 1,
    minWidth: 0,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 1, 0.6)',
    flexShrink: 0,
  },
  distancePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rates: {
    ...typography.small,
    color: colors.accentDark,
    marginTop: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 12,
    color: colors.primaryDark,
  },
});
