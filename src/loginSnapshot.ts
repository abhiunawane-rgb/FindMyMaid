import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PricingCountry } from './constants/localeDisplay';
import type { MaidOwnProfile, PublicMaid, UserOwnProfile, UserRole } from './types';
import { normalizePhoneDigits } from './utils/maidId';

type PlanPeriodStored = 'monthly' | 'yearly';

export type LeadSnap = { month: string; count: number };

/** Matches contact events on device (reviews, contact history). */
export type ContactSnap = {
  id: string;
  maidId: string;
  at: number;
  userRating?: number;
  userReview?: string;
};

export type AccountSnapshotV1 = {
  v: 1;
  phone: string;
  displayName: string;
  maidProfile: MaidOwnProfile | null;
  userProfile: UserOwnProfile | null;
  userPremiumUntil: number | null;
  userPremiumPlan: PlanPeriodStored | 'none';
  maidProUntil: number | null;
  maidProPlan: PlanPeriodStored | 'none';
  freeContactsUsed: number;
  userPremiumAutoRenew: boolean;
  leadsByMaid: Record<string, LeadSnap>;
  contactEvents: ContactSnap[];
  localPublishedMaids: PublicMaid[];
  pricingCountry: PricingCountry;
};

const KEY = 'findmymaid_login_snapshots_v1';

export function snapshotKey(phoneNorm: string, role: UserRole): string {
  return `${phoneNorm}_${role}`;
}

export async function readAccountSnapshot(
  phoneNorm: string,
  role: UserRole
): Promise<AccountSnapshotV1 | null> {
  if (phoneNorm.length < 8) return null;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, AccountSnapshotV1>;
    const row = all[snapshotKey(phoneNorm, role)];
    return row && row.v === 1 ? row : null;
  } catch {
    return null;
  }
}

export async function persistAccountSnapshot(
  payload: AccountSnapshotV1,
  role: UserRole
): Promise<void> {
  try {
    const norm = normalizePhoneDigits(payload.phone);
    if (norm.length < 8) return;
    const raw = await AsyncStorage.getItem(KEY);
    const all = (raw ? JSON.parse(raw) : {}) as Record<string, AccountSnapshotV1>;
    all[snapshotKey(norm, role)] = { ...payload, v: 1 };
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export async function clearSnapshotsForPhoneDigits(phoneDigits: string): Promise<void> {
  const norm = normalizePhoneDigits(phoneDigits);
  if (norm.length < 8) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as Record<string, AccountSnapshotV1>;
    delete all[snapshotKey(norm, 'maid')];
    delete all[snapshotKey(norm, 'user')];
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export async function clearAllSnapshots(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function maidProfileLooksComplete(profile: MaidOwnProfile | null): boolean {
  if (!profile) return false;
  const d = profile.displayName?.trim() ?? '';
  if (d.length < 1) return false;
  if (!profile.phone?.trim()) return false;
  if (!profile.services?.length) return false;
  const { m30, h1, h2, h24 } = profile.rates ?? {};
  if (!Number.isFinite(m30) || m30 <= 0) return false;
  if (!Number.isFinite(h1) || h1 <= 0) return false;
  if (!Number.isFinite(h2) || h2 <= 0) return false;
  if (!Number.isFinite(h24) || h24 <= 0) return false;
  return true;
}

export function userProfileLooksComplete(profile: UserOwnProfile | null): boolean {
  if (!profile) return false;
  const d = profile.displayName?.trim() ?? '';
  return d.length >= 2;
}
