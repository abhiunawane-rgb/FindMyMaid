import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRole } from './types';
import { normalizePhoneDigits } from './utils/maidId';

const KEY = 'findmymaid_phone_role_binding_v1';

type Store = Record<string, UserRole>;

async function readStore(): Promise<Store> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    return p && typeof p === 'object' && !Array.isArray(p) ? (p as Store) : {};
  } catch {
    return {};
  }
}

async function writeStore(s: Store): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

/** One phone number may only ever be family OR helper on this device when API is off. */
export async function getRegisteredRoleForPhone(phoneRaw: string): Promise<UserRole | null> {
  const norm = normalizePhoneDigits(phoneRaw);
  if (norm.length < 8) return null;
  const s = await readStore();
  const r = s[norm];
  return r === 'maid' || r === 'user' ? r : null;
}

export async function setRegisteredRoleForPhone(phoneRaw: string, role: UserRole): Promise<void> {
  const norm = normalizePhoneDigits(phoneRaw);
  if (norm.length < 8) return;
  const s = await readStore();
  s[norm] = role;
  await writeStore(s);
}

export async function clearPhoneRoleBindings(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/** Remove binding for one number (e.g. after account delete on this device). */
export async function removeRegisteredRoleForPhone(phoneRaw: string): Promise<void> {
  const norm = normalizePhoneDigits(phoneRaw);
  if (norm.length < 8) return;
  const s = await readStore();
  delete s[norm];
  await writeStore(s);
}
