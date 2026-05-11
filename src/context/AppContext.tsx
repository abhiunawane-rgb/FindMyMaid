import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import {
  DEFAULT_PRICING_COUNTRY,
  type PricingCountry,
} from '../constants/localeDisplay';
import {
  FREE_CONTACTS_TOTAL,
  FREE_LEADS_PER_MONTH,
  MAID_PLANS,
  USER_PLANS,
} from '../constants/subscriptions';
import {
  isDemoMaidId,
  maidOwnProfileToPublic,
  normalizeMaidOwnProfile,
} from '../data/mockMaids';
import { API_SYNC_ENABLED } from '../constants/api';
import type { AccountSnapshotV1 } from '../loginSnapshot';
import {
  clearAllSnapshots,
  clearSnapshotsForPhoneDigits,
  maidProfileLooksComplete,
  persistAccountSnapshot,
  readAccountSnapshot,
  userProfileLooksComplete,
} from '../loginSnapshot';
import {
  exchangeOtpSession,
  fetchMaidOwnListing,
  postMaidReviewToServer,
  pushMaidProfile,
  requestOtpDelivery,
  setApiToken,
  type OtpSendResult,
} from '../services/backend';
import {
  clearPhoneRoleBindings,
  getRegisteredRoleForPhone,
  removeRegisteredRoleForPhone,
  setRegisteredRoleForPhone,
} from '../phoneRoleBinding';
import { maidIdFromPhone, normalizePhoneDigits } from '../utils/maidId';
import type { MaidOwnProfile, PublicMaid, UserOwnProfile, UserRole } from '../types';
import { buildDisplayNameFromUserParts } from '../types';
import { colors } from '../theme';

const STORAGE_KEY = 'findmymaid_v2';

export type AuthStep = 'welcome' | 'auth' | 'otp' | 'maid_setup' | 'user_setup' | 'main';
export type AuthMode = 'signup' | 'login';

export type PlanPeriod = 'monthly' | 'yearly';

type LeadEntry = { month: string; count: number };
type ContactEvent = {
  id: string;
  maidId: string;
  at: number;
  userRating?: number;
  userReview?: string;
};

type State = {
  role: UserRole | null;
  authMode: AuthMode;
  step: AuthStep;
  phone: string;
  displayName: string;
  otpSent: boolean;
  maidProfile: MaidOwnProfile | null;
  userProfile: UserOwnProfile | null;
  /** Family: unlimited contacts until expiry */
  userPremiumUntil: number | null;
  userPremiumPlan: 'none' | PlanPeriod;
  /** Maid Pro: unlimited leads + visibility perks until expiry */
  maidProUntil: number | null;
  maidProPlan: 'none' | PlanPeriod;
  /** Non-premium families: lifetime free contacts used (max FREE_CONTACTS_TOTAL) */
  freeContactsUsed: number;
  /** Preference for store renewal (demo; real billing later) */
  userPremiumAutoRenew: boolean;
  /** Leads received per maid id (real profiles only; demo ids skipped) */
  leadsByMaid: Record<string, LeadEntry>;
  /** Families: contact timeline for profile insights and pending review nudges. */
  contactEvents: ContactEvent[];
  /**
   * Helpers who completed setup on this device — merged into the family Discover list (offline demo).
   * Kept after sign-out so you can test maid + customer on one phone without a backend.
   */
  localPublishedMaids: PublicMaid[];
  /** Pricing display region (UI-only; store billing remains App Store / Play driven). */
  pricingCountry: PricingCountry;
};

const defaultState: State = {
  role: null,
  authMode: 'signup',
  step: 'welcome',
  phone: '',
  displayName: '',
  otpSent: false,
  maidProfile: null,
  userProfile: null,
  userPremiumUntil: null,
  userPremiumPlan: 'none',
  maidProUntil: null,
  maidProPlan: 'none',
  freeContactsUsed: 0,
  userPremiumAutoRenew: true,
  leadsByMaid: {},
  contactEvents: [],
  localPublishedMaids: [],
  pricingCountry: DEFAULT_PRICING_COUNTRY,
};

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function normalizeLeads(raw: Record<string, LeadEntry>): Record<string, LeadEntry> {
  const mk = monthKey();
  const out: Record<string, LeadEntry> = { ...raw };
  for (const key of Object.keys(out)) {
    if (out[key].month !== mk) {
      out[key] = { month: mk, count: 0 };
    }
  }
  return out;
}

function buildSnapshotFromState(s: State): AccountSnapshotV1 | null {
  if (!s.role) return null;
  if (normalizePhoneDigits(s.phone).length < 8) return null;
  if (!s.maidProfile && !s.userProfile) return null;
  return {
    v: 1,
    phone: s.phone,
    displayName: s.displayName,
    maidProfile: s.maidProfile,
    userProfile: s.userProfile,
    userPremiumUntil: s.userPremiumUntil,
    userPremiumPlan: s.userPremiumPlan,
    maidProUntil: s.maidProUntil,
    maidProPlan: s.maidProPlan,
    freeContactsUsed: s.freeContactsUsed,
    userPremiumAutoRenew: s.userPremiumAutoRenew,
    leadsByMaid: { ...s.leadsByMaid },
    contactEvents: s.contactEvents.map((e) => ({ ...e })),
    localPublishedMaids: [...s.localPublishedMaids],
    pricingCountry: s.pricingCountry,
  };
}

function normalizeStoredPublicMaid(raw: PublicMaid): PublicMaid {
  const ratesRaw = raw.rates as { m30?: number; h1?: number; h2?: number; h24?: number };
  const m30 = Number(ratesRaw?.m30) || 0;
  const h1 = Number(ratesRaw?.h1) || 0;
  const h2 = Number(ratesRaw?.h2) || 0;
  let h24 = Number(ratesRaw?.h24) || 0;
  if (!(Number.isFinite(h24) && h24 > 0)) {
    const h2v = Number.isFinite(h2) && h2 > 0 ? h2 : 600;
    const h1v = Number.isFinite(h1) && h1 > 0 ? h1 : 350;
    h24 = Math.max(Math.round(h2v * 8), Math.round(h1v * 12));
  }
  return {
    ...raw,
    age: typeof raw.age === 'number' && Number.isFinite(raw.age) ? raw.age : 30,
    rates: {
      m30: Number.isFinite(m30) && m30 > 0 ? m30 : 200,
      h1: Number.isFinite(h1) && h1 > 0 ? h1 : 350,
      h2: Number.isFinite(h2) && h2 > 0 ? h2 : 600,
      h24: Math.round(h24),
    },
  };
}

function mergeLocalPublishedForMaid(maids: PublicMaid[], mp: MaidOwnProfile): PublicMaid[] {
  const pub = maidOwnProfileToPublic({ ...normalizeMaidOwnProfile(mp), verified: true });
  const idx = maids.findIndex((m) => m.id === pub.id);
  if (idx >= 0) return maids.map((m, i) => (i === idx ? pub : m));
  return [...maids, pub];
}

type Ctx = {
  state: State;
  setRole: (r: UserRole) => void;
  setAuthMode: (m: AuthMode) => void;
  setPhone: (p: string) => void;
  setDisplayName: (n: string) => void;
  sendOtp: () => void;
  /** Resend SMS OTP (same number as on Auth step). */
  retrySendOtp: () => Promise<OtpSendResult>;
  verifyOtpAndContinue: (code: string) => Promise<boolean>;
  saveMaidProfile: (p: MaidOwnProfile) => void;
  /** Helpers: refresh GPS for discovery distance (same device / local list). */
  updateMaidServiceLocation: () => Promise<boolean>;
  /** Helpers: name and photo only — phone stays fixed. */
  updateMaidProfile: (
    updates: Partial<Pick<MaidOwnProfile, 'displayName' | 'photoUri' | 'age' | 'rates'>>
  ) => void;
  saveUserProfile: (p: UserOwnProfile) => void;
  updateUserProfile: (updates: Partial<UserOwnProfile>) => void;
  logout: () => void;
  deleteAccount: () => void;
  resetAllLocalData: () => void;
  isUserPremium: () => boolean;
  isMaidPro: () => boolean;
  purchaseUserPremium: (plan: PlanPeriod) => void;
  purchaseMaidPro: (plan: PlanPeriod) => void;
  canContactMaid: () => boolean;
  maidCanReceiveContact: (maidId: string) => boolean;
  getLeadCount: (maidId: string) => number;
  registerContact: (maidId: string) => boolean;
  /** Updates local contact timeline; when API sync is on, publishes review for other families. */
  submitContactReview: (
    contactId: string,
    maidId: string,
    rating: number,
    review: string
  ) => Promise<PublicMaid | null>;
  getContactsForMaid: (maidId: string) => ContactEvent[];
  setPricingCountry: (country: PricingCountry) => void;
  setUserPremiumAutoRenew: (v: boolean) => void;
  FREE_CONTACTS_TOTAL: number;
  FREE_LEADS_PER_MONTH: number;
  /** Create-account flow: return to role selection */
  backFromAuth: () => void;
  /** Create-account flow: return to sign-up fields */
  backFromOtp: () => void;
  /** After OTP: return to account details */
  backFromSetup: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<State> & {
            contactsThisMonth?: number;
            contactMonth?: string;
          };
          if (
            typeof parsed.freeContactsUsed !== 'number' &&
            typeof parsed.contactsThisMonth === 'number'
          ) {
            parsed.freeContactsUsed = Math.min(FREE_CONTACTS_TOTAL, parsed.contactsThisMonth);
          }
          if (typeof parsed.freeContactsUsed !== 'number') {
            parsed.freeContactsUsed = 0;
          }
          if (typeof parsed.userPremiumAutoRenew !== 'boolean') {
            parsed.userPremiumAutoRenew = true;
          }
          if (parsed.maidProfile && !parsed.maidProfile.id) {
            parsed.maidProfile = {
              ...parsed.maidProfile,
              id: maidIdFromPhone(parsed.phone || ''),
            };
          }
          if (parsed.maidProfile && parsed.phone) {
            const canonicalId = maidIdFromPhone(parsed.phone);
            const oldId = parsed.maidProfile.id;
            if (oldId && oldId !== canonicalId && oldId.startsWith('maid_')) {
              parsed.maidProfile = { ...parsed.maidProfile, id: canonicalId };
              const lbm = parsed.leadsByMaid ?? {};
              if (lbm[oldId]) {
                const { [oldId]: ent, ...rest } = lbm as Record<string, LeadEntry>;
                parsed.leadsByMaid = { ...rest, [canonicalId]: ent };
              }
              if (Array.isArray(parsed.contactEvents)) {
                parsed.contactEvents = parsed.contactEvents.map((e) =>
                  e.maidId === oldId ? { ...e, maidId: canonicalId } : e
                );
              }
              if (Array.isArray(parsed.localPublishedMaids)) {
                parsed.localPublishedMaids = (parsed.localPublishedMaids as PublicMaid[]).map((m) =>
                  m.id === oldId ? { ...m, id: canonicalId } : m
                );
              }
            }
          }
          if (parsed.maidProfile && !parsed.maidProfile.gender) {
            parsed.maidProfile = { ...parsed.maidProfile, gender: 'female' };
          }
          if (parsed.maidProfile && typeof parsed.maidProfile.age !== 'number') {
            parsed.maidProfile = { ...parsed.maidProfile, age: 30 };
          }
          if (parsed.maidProfile && typeof parsed.maidProfile === 'object') {
            parsed.maidProfile = normalizeMaidOwnProfile(parsed.maidProfile as MaidOwnProfile);
          }
          if (parsed.userProfile && !parsed.userProfile.gender) {
            parsed.userProfile = { ...parsed.userProfile, gender: 'female' };
          }
          if (parsed.userProfile && !parsed.userProfile.firstName && !parsed.userProfile.lastName) {
            const d = (parsed.userProfile.displayName || '').trim();
            const parts = d.split(/\s+/).filter(Boolean);
            parsed.userProfile = {
              ...parsed.userProfile,
              firstName: parts[0] || '',
              lastName: parts.slice(1).join(' ') || '',
            };
          }
          let localPublished = Array.isArray(parsed.localPublishedMaids)
            ? (parsed.localPublishedMaids as PublicMaid[])
            : [];
          localPublished = localPublished.map((m) => normalizeStoredPublicMaid(m));
          if (parsed.maidProfile?.id) {
            const pub = maidOwnProfileToPublic(parsed.maidProfile as MaidOwnProfile);
            const idx = localPublished.findIndex((pm) => pm.id === pub.id);
            localPublished =
              idx >= 0
                ? localPublished.map((pm, i) => (i === idx ? pub : pm))
                : [...localPublished, pub];
          }
          setState({
            ...defaultState,
            ...parsed,
            leadsByMaid: normalizeLeads(parsed.leadsByMaid ?? {}),
            userPremiumPlan: parsed.userPremiumPlan ?? 'none',
            maidProPlan: parsed.maidProPlan ?? 'none',
            localPublishedMaids: localPublished,
          });
        }
      } catch {
        /* ignore */
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const setRole = useCallback((role: UserRole) => {
    setState((s) => ({ ...s, role, step: 'auth' }));
  }, []);

  const setAuthMode = useCallback((authMode: AuthMode) => {
    setState((s) => ({ ...s, authMode, step: 'auth' }));
  }, []);

  const setPhone = useCallback((phone: string) => {
    setState((s) => ({ ...s, phone }));
  }, []);

  const setDisplayName = useCallback((displayName: string) => {
    setState((s) => ({ ...s, displayName }));
  }, []);

  const sendOtp = useCallback(() => {
    setState((s) => ({ ...s, otpSent: true, step: 'otp' }));
  }, []);

  const retrySendOtp = useCallback(async (): Promise<OtpSendResult> => {
    const raw = state.phone.trim();
    if (raw.length < 5) return 'bad_request';
    return requestOtpDelivery(raw);
  }, [state.phone]);

  const backFromAuth = useCallback(() => {
    setState((s) => ({
      ...s,
      step: 'welcome',
      role: null,
      authMode: 'signup',
      phone: '',
      displayName: '',
      otpSent: false,
    }));
  }, []);

  const backFromOtp = useCallback(() => {
    setState((s) => ({
      ...s,
      step: 'auth',
      otpSent: false,
    }));
  }, []);

  const backFromSetup = useCallback(() => {
    setState((s) => ({ ...s, step: 'auth' }));
  }, []);

  const verifyOtpAndContinue = useCallback(
    async (code: string) => {
      const role = state.role;
      const phone = state.phone;
      if (!role) {
        Alert.alert(
          'Can’t verify yet',
          'Go back once, confirm you chose Family or Helper, enter your number, then try the code again.'
        );
        return false;
      }
      try {
        const result = await exchangeOtpSession(phone, role, code);
        if (!result.ok) {
          if (result.reason === 'invalid_code') {
            Alert.alert('Invalid code', 'Enter the verification code we sent to your phone.');
          } else if (result.reason === 'invalid_phone') {
            Alert.alert(
              'Invalid phone number',
              'This phone number format is not valid. Go back and include country code if needed.'
            );
          } else if (result.reason === 'network') {
            Alert.alert(
              'Sign-in failed',
              'Could not reach the FindMyMaid server or the request timed out. Check Wi‑Fi/mobile data and that the API URL is correct in your build.'
            );
          } else if (result.reason === 'sms_verify_failed') {
            Alert.alert(
              'SMS verification error',
              'The server could not verify this code with the SMS provider. Try Resend OTP, or check Twilio Verify on the backend.'
            );
          } else if (result.reason === 'sms_not_configured') {
            Alert.alert(
              'SMS not configured',
              'The server cannot verify codes yet. Configure Twilio on the API or set OTP_DEV_BYPASS for development.'
            );
          } else if (result.reason === 'phone_role_conflict') {
            Alert.alert(
              'Number already signed up differently',
              'This mobile number is already linked as another account type. Use your original role to sign in, or sign up with a different number.'
            );
          } else {
            Alert.alert('Sign-in failed', 'Something went wrong. Try again in a moment.');
          }
          return false;
        }

        const phoneNorm = normalizePhoneDigits(phone);
        if (phoneNorm.length >= 8) {
          const existingBind = await getRegisteredRoleForPhone(phone);
          if (existingBind && existingBind !== role) {
            Alert.alert(
              'This phone is locked to another profile type here',
              'On this device, this number already finished sign-up as a ' +
                (existingBind === 'maid' ? 'helper' : 'family') +
                '. One number cannot be both. Use Erase all local data in Settings to reset this phone, then create a fresh account.'
            );
            return false;
          }
          await setRegisteredRoleForPhone(phone, role);
        }

        const authMode = state.authMode;

        if (role === 'maid' && API_SYNC_ENABLED) {
          const remote = await fetchMaidOwnListing();
          if (remote && maidProfileLooksComplete(normalizeMaidOwnProfile(remote))) {
            const snapExtras =
              authMode === 'login' && phoneNorm.length >= 8
                ? await readAccountSnapshot(phoneNorm, role)
                : null;
            const maidPro = { ...normalizeMaidOwnProfile(remote), verified: true as const };
            setState({
              ...defaultState,
              role,
              authMode,
              phone,
              otpSent: false,
              step: 'main',
              maidProfile: maidPro,
              displayName: remote.displayName.trim() || state.displayName,
              localPublishedMaids: mergeLocalPublishedForMaid([], maidPro),
              maidProUntil: snapExtras?.maidProUntil ?? null,
              maidProPlan: snapExtras?.maidProPlan ?? 'none',
              pricingCountry: snapExtras?.pricingCountry ?? DEFAULT_PRICING_COUNTRY,
            });
            return true;
          }
        }

        if (authMode === 'login' && phoneNorm.length >= 8) {
          const snap = await readAccountSnapshot(phoneNorm, role);
          if (snap) {
            const snapMaid = snap.maidProfile ? normalizeMaidOwnProfile(snap.maidProfile) : null;
            let localPublishedMaids = Array.isArray(snap.localPublishedMaids)
              ? [...snap.localPublishedMaids.map((m) => normalizeStoredPublicMaid(m))]
              : [];
            if (role === 'maid' && snapMaid?.id && maidProfileLooksComplete(snapMaid)) {
              localPublishedMaids = mergeLocalPublishedForMaid(localPublishedMaids, snapMaid);
            }
            const maidOk =
              role === 'maid' && snapMaid != null && maidProfileLooksComplete(snapMaid);
            const userOk =
              role === 'user' &&
              snap.userProfile != null &&
              userProfileLooksComplete(snap.userProfile);
            if (maidOk || userOk) {
              setState({
                ...defaultState,
                phone: phone.trim().length ? phone : snap.phone,
                displayName: snap.displayName,
                maidProfile: snapMaid,
                userProfile: snap.userProfile,
                userPremiumUntil: snap.userPremiumUntil,
                userPremiumPlan: snap.userPremiumPlan,
                maidProUntil: snap.maidProUntil,
                maidProPlan: snap.maidProPlan,
                freeContactsUsed: snap.freeContactsUsed,
                userPremiumAutoRenew: snap.userPremiumAutoRenew,
                leadsByMaid: normalizeLeads(snap.leadsByMaid ?? {}),
                contactEvents: [...(snap.contactEvents ?? [])],
                localPublishedMaids,
                pricingCountry: snap.pricingCountry,
                role,
                authMode,
                otpSent: false,
                step: 'main',
              });
              return true;
            }
          }
        }

        setState((s0) => ({
          ...s0,
          otpSent: false,
          phone,
          step: role === 'maid' ? 'maid_setup' : 'user_setup',
        }));
        return true;
      } catch {
        Alert.alert(
          'Verification interrupted',
          'Check your internet connection and try again. If it keeps failing, reinstall the latest app build.'
        );
        return false;
      }
    },
    [state.phone, state.role, state.authMode, state.displayName]
  );

  const saveMaidProfile = useCallback((maidProfile: MaidOwnProfile) => {
    const full = { ...normalizeMaidOwnProfile(maidProfile), verified: true };
    void setRegisteredRoleForPhone(full.phone, 'maid');
    const pub = maidOwnProfileToPublic(full);
    setState((s) => {
      const idx = s.localPublishedMaids.findIndex((m) => m.id === pub.id);
      const localPublishedMaids =
        idx >= 0
          ? s.localPublishedMaids.map((m, i) => (i === idx ? pub : m))
          : [...s.localPublishedMaids, pub];
      return {
        ...s,
        maidProfile: full,
        displayName: full.displayName.trim() || s.displayName,
        localPublishedMaids,
        step: 'main',
      };
    });
    void (async () => {
      const ok = await pushMaidProfile(full);
      if (!ok && API_SYNC_ENABLED) {
        Alert.alert(
          'Sync warning',
          'Your profile is saved on this device but could not be uploaded. Check network and API URL, then try updating from My Profile.'
        );
      }
    })();
  }, []);

  const updateMaidServiceLocation = useCallback(async () => {
    const profile = state.maidProfile;
    if (!profile) return false;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location',
          'Allow location so nearby families can see accurate distance to you.'
        );
        return false;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const locationLat = pos.coords.latitude;
      const locationLng = pos.coords.longitude;
      const merged: MaidOwnProfile = { ...profile, locationLat, locationLng };
      const pub = maidOwnProfileToPublic({ ...merged, verified: true });
      setState((s) => {
        const idx = s.localPublishedMaids.findIndex((m) => m.id === pub.id);
        const localPublishedMaids =
          idx >= 0
            ? s.localPublishedMaids.map((m, i) => (i === idx ? pub : m))
            : [...s.localPublishedMaids, pub];
        return { ...s, maidProfile: merged, localPublishedMaids };
      });
      void pushMaidProfile({ ...merged, verified: true });
      return true;
    } catch {
      Alert.alert('Location', 'Could not read your position. Try again with GPS on.');
      return false;
    }
  }, [state.maidProfile]);

  const updateMaidProfile = useCallback(
    (updates: Partial<Pick<MaidOwnProfile, 'displayName' | 'photoUri' | 'age' | 'rates'>>) => {
      setState((s) => {
        if (!s.maidProfile) return s;
        const merged: MaidOwnProfile = normalizeMaidOwnProfile({
          ...s.maidProfile,
          ...updates,
          rates: updates.rates ? { ...s.maidProfile.rates, ...updates.rates } : s.maidProfile.rates,
        });
        if (updates.displayName !== undefined) {
          merged.displayName = updates.displayName.trim();
        }
        const pub = maidOwnProfileToPublic({ ...merged, verified: true });
        const idx = s.localPublishedMaids.findIndex((m) => m.id === pub.id);
        const localPublishedMaids =
          idx >= 0
            ? s.localPublishedMaids.map((m, i) => (i === idx ? pub : m))
            : [...s.localPublishedMaids, pub];
        queueMicrotask(() => {
          void (async () => {
            const ok = await pushMaidProfile({ ...merged, verified: true });
            if (!ok && API_SYNC_ENABLED) {
              Alert.alert(
                'Sync warning',
                'Profile updated here but not on the server. Check your connection.'
              );
            }
          })();
        });
        return {
          ...s,
          maidProfile: merged,
          displayName: merged.displayName,
          localPublishedMaids,
        };
      });
    },
    []
  );

  const saveUserProfile = useCallback((userProfile: UserOwnProfile) => {
    const full = buildDisplayNameFromUserParts(userProfile);
    void setRegisteredRoleForPhone(userProfile.phone, 'user');
    setState((s) => ({
      ...s,
      userProfile: { ...userProfile, displayName: full },
      displayName: full,
      step: 'main',
    }));
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserOwnProfile>) => {
    setState((s) => {
      if (!s.userProfile) return s;
      const merged = { ...s.userProfile, ...updates };
      const full = buildDisplayNameFromUserParts(merged);
      return {
        ...s,
        userProfile: { ...merged, displayName: full },
        displayName: full,
      };
    });
  }, []);

  const logout = useCallback(() => {
    void setApiToken(null);
    setState((s) => {
      const snap = buildSnapshotFromState(s);
      if (snap && s.role) void persistAccountSnapshot(snap, s.role);
      return {
        ...defaultState,
        localPublishedMaids: s.localPublishedMaids,
      };
    });
  }, []);

  const deleteAccount = useCallback(() => {
    void setApiToken(null);
    void clearSnapshotsForPhoneDigits(state.phone);
    void removeRegisteredRoleForPhone(state.phone);
    setState(defaultState);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, [state.phone]);

  const resetAllLocalData = useCallback(() => {
    void setApiToken(null);
    void clearAllSnapshots();
    void clearPhoneRoleBindings();
    setState(defaultState);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const isUserPremium = useCallback(() => {
    const t = state.userPremiumUntil;
    return typeof t === 'number' && t > Date.now();
  }, [state.userPremiumUntil]);

  const isMaidPro = useCallback(() => {
    const t = state.maidProUntil;
    return typeof t === 'number' && t > Date.now();
  }, [state.maidProUntil]);

  const purchaseUserPremium = useCallback((plan: PlanPeriod) => {
    const p = USER_PLANS[plan];
    setState((s) => ({
      ...s,
      userPremiumUntil: Date.now() + p.durationMs,
      userPremiumPlan: plan,
    }));
  }, []);

  const purchaseMaidPro = useCallback((plan: PlanPeriod) => {
    const p = MAID_PLANS[plan];
    setState((s) => ({
      ...s,
      maidProUntil: Date.now() + p.durationMs,
      maidProPlan: plan,
    }));
  }, []);

  const setUserPremiumAutoRenew = useCallback((userPremiumAutoRenew: boolean) => {
    setState((s) => ({ ...s, userPremiumAutoRenew }));
  }, []);

  const setPricingCountry = useCallback((pricingCountry: PricingCountry) => {
    setState((s) => ({ ...s, pricingCountry }));
  }, []);

  const getLeadCount = useCallback(
    (maidId: string) => {
      const mk = monthKey();
      const e = state.leadsByMaid[maidId];
      if (!e || e.month !== mk) return 0;
      return e.count;
    },
    [state.leadsByMaid]
  );

  const maidHasProForId = useCallback(
    (maidId: string) => {
      if (state.maidProfile?.id === maidId) return isMaidPro();
      return false;
    },
    [state.maidProfile?.id, isMaidPro]
  );

  const maidCanReceiveContact = useCallback(
    (maidId: string) => {
      if (isDemoMaidId(maidId)) return true;
      if (maidHasProForId(maidId)) return true;
      return getLeadCount(maidId) < FREE_LEADS_PER_MONTH;
    },
    [getLeadCount, maidHasProForId]
  );

  const canContactMaid = useCallback(() => {
    if (isUserPremium()) return true;
    return state.freeContactsUsed < FREE_CONTACTS_TOTAL;
  }, [isUserPremium, state.freeContactsUsed]);

  const registerContact = useCallback(
    (maidId: string) => {
      if (!maidCanReceiveContact(maidId)) return false;
      if (!canContactMaid()) return false;
      if (state.contactEvents.some((e) => e.maidId === maidId)) return true;

      if (isUserPremium()) {
        if (!isDemoMaidId(maidId)) {
          setState((s) => {
            const mk = monthKey();
            const prev = s.leadsByMaid[maidId];
            const cnt = prev && prev.month === mk ? prev.count : 0;
            return {
              ...s,
              leadsByMaid: {
                ...s.leadsByMaid,
                [maidId]: { month: mk, count: cnt + 1 },
              },
              contactEvents: [
                ...s.contactEvents,
                { id: `c_${Date.now()}_${Math.random()}`, maidId, at: Date.now() },
              ],
            };
          });
        } else {
          setState((s) => ({
            ...s,
            contactEvents: [
              ...s.contactEvents,
              { id: `c_${Date.now()}_${Math.random()}`, maidId, at: Date.now() },
            ],
          }));
        }
        return true;
      }

      let ok = false;
      setState((s) => {
        if (s.freeContactsUsed >= FREE_CONTACTS_TOTAL) return s;

        const mk = monthKey();
        let leads = { ...s.leadsByMaid };
        if (!isDemoMaidId(maidId)) {
          const prev = leads[maidId];
          const cnt = prev && prev.month === mk ? prev.count : 0;
          leads = { ...leads, [maidId]: { month: mk, count: cnt + 1 } };
        }

        ok = true;
        return {
          ...s,
          freeContactsUsed: s.freeContactsUsed + 1,
          leadsByMaid: leads,
          contactEvents: [
            ...s.contactEvents,
            { id: `c_${Date.now()}_${Math.random()}`, maidId, at: Date.now() },
          ],
        };
      });
      return ok;
    },
    [canContactMaid, isUserPremium, maidCanReceiveContact, state.contactEvents]
  );

  const submitContactReview = useCallback(
    async (
      contactId: string,
      maidId: string,
      rating: number,
      review: string
    ): Promise<PublicMaid | null> => {
      const trimmed = review.trim();
      if (trimmed.length < 1) {
        Alert.alert(
          'Add a comment',
          'Write a short note so other families can learn from your experience.'
        );
        return null;
      }
      const rn = Math.max(1, Math.min(5, Math.round(rating)));
      const authorDisplayName = (
        state.userProfile
          ? buildDisplayNameFromUserParts(state.userProfile)
          : state.displayName.trim()
      ).trim();
      if (authorDisplayName.length < 2) {
        Alert.alert(
          'Name required',
          'Add your name in My Profile (or finish sign-up) before posting a public review.'
        );
        return null;
      }

      setState((s) => ({
        ...s,
        contactEvents: s.contactEvents.map((e) =>
          e.id === contactId
            ? {
                ...e,
                userRating: rn,
                userReview: trimmed,
              }
            : e
        ),
      }));

      if (!API_SYNC_ENABLED || isDemoMaidId(maidId)) return null;

      const updated = await postMaidReviewToServer(maidId, {
        rating: rn,
        comment: trimmed,
        authorDisplayName,
        authorPhotoUri: state.userProfile?.photoUri ?? null,
      });
      return updated;
    },
    [state.displayName, state.userProfile]
  );

  const getContactsForMaid = useCallback(
    (maidId: string) => state.contactEvents.filter((e) => e.maidId === maidId),
    [state.contactEvents]
  );

  const value = useMemo(
    () => ({
      state,
      setRole,
      setAuthMode,
      setPhone,
      setDisplayName,
      sendOtp,
      retrySendOtp,
      verifyOtpAndContinue,
      saveMaidProfile,
      updateMaidServiceLocation,
      updateMaidProfile,
      saveUserProfile,
      updateUserProfile,
      logout,
      deleteAccount,
      resetAllLocalData,
      isUserPremium,
      isMaidPro,
      purchaseUserPremium,
      purchaseMaidPro,
      canContactMaid,
      maidCanReceiveContact,
      getLeadCount,
      registerContact,
      submitContactReview,
      getContactsForMaid,
      setPricingCountry,
      setUserPremiumAutoRenew,
      FREE_CONTACTS_TOTAL,
      FREE_LEADS_PER_MONTH,
      backFromAuth,
      backFromOtp,
      backFromSetup,
    }),
    [
      state,
      setRole,
      setAuthMode,
      setPhone,
      setDisplayName,
      sendOtp,
      retrySendOtp,
      backFromAuth,
      backFromOtp,
      backFromSetup,
      verifyOtpAndContinue,
      saveMaidProfile,
      updateMaidServiceLocation,
      updateMaidProfile,
      saveUserProfile,
      updateUserProfile,
      logout,
      deleteAccount,
      resetAllLocalData,
      isUserPremium,
      isMaidPro,
      purchaseUserPremium,
      purchaseMaidPro,
      canContactMaid,
      maidCanReceiveContact,
      getLeadCount,
      registerContact,
      submitContactReview,
      getContactsForMaid,
      setPricingCountry,
      setUserPremiumAutoRenew,
    ]
  );

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp needs AppProvider');
  return c;
}
