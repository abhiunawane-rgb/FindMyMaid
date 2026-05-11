import AsyncStorage from '@react-native-async-storage/async-storage';
import { OTP_MIN_DIGITS } from '../constants/auth';
import { API_BASE_URL, API_FETCH_TIMEOUT_MS, API_SYNC_ENABLED } from '../constants/api';

async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
import type { Gender, MaidOwnProfile, PublicMaid, ServiceId } from '../types';

function apiMaidJsonToOwnProfile(m: Record<string, unknown>): MaidOwnProfile | null {
  const id = String(m.id ?? '');
  if (!id.length) return null;
  const servicesRaw = m.services;
  const services: ServiceId[] = Array.isArray(servicesRaw)
    ? (servicesRaw.filter((x) => typeof x === 'string') as ServiceId[])
    : [];
  const ratesRaw = m.rates as Record<string, unknown> | undefined;
  const m30 = Number(ratesRaw?.m30);
  const h1 = Number(ratesRaw?.h1);
  const h2 = Number(ratesRaw?.h2);
  let h24 = Number(ratesRaw?.h24);
  if (!services.length || !Number.isFinite(m30) || m30 <= 0) return null;
  if (!Number.isFinite(h1) || h1 <= 0 || !Number.isFinite(h2) || h2 <= 0) return null;
  if (!Number.isFinite(h24) || h24 <= 0) {
    h24 = Math.max(Math.round(h2 * 8), Math.round(h1 * 12));
  }
  const latRaw = m.lat;
  const lngRaw = m.lng;
  const lat =
    typeof latRaw === 'number' && Number.isFinite(latRaw)
      ? latRaw
      : latRaw != null && Number.isFinite(Number(latRaw))
        ? Number(latRaw)
        : undefined;
  const lng =
    typeof lngRaw === 'number' && Number.isFinite(lngRaw)
      ? lngRaw
      : lngRaw != null && Number.isFinite(Number(lngRaw))
        ? Number(lngRaw)
        : undefined;

  const genderRaw = m.gender;
  const gender: Gender = genderRaw === 'male' || genderRaw === 'female' ? genderRaw : 'female';
  const ageRaw = Number(m.age);
  const age = Number.isFinite(ageRaw) && ageRaw >= 18 ? Math.round(ageRaw) : 18;

  return {
    id,
    displayName: String(m.displayName ?? '').trim(),
    phone: String(m.phone ?? ''),
    gender,
    age,
    photoUri: m.photoUri != null ? String(m.photoUri) : null,
    rates: { m30, h1, h2, h24 },
    services,
    verified: Boolean(m.verified !== false),
    locationLat: lat,
    locationLng: lng,
  };
}

const TOKEN_KEY = 'findmymaid_api_token';

export async function getApiToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setApiToken(token: string | null): Promise<void> {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export type OtpSendResult =
  | 'ok'
  | 'sms_not_configured'
  | 'sms_send_failed'
  | 'invalid_phone'
  | 'bad_request'
  | 'network';

export async function requestOtpDelivery(phone: string): Promise<OtpSendResult> {
  if (!API_SYNC_ENABLED) return 'ok';
  try {
    const res = await apiFetch(`${API_BASE_URL}/v1/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 503) return 'sms_not_configured';
    if (res.status === 502 && data.error === 'sms_send_failed') return 'sms_send_failed';
    if (res.status === 400 && data.error === 'invalid_phone') return 'invalid_phone';
    if (res.status === 400) return 'bad_request';
    if (!res.ok) return 'network';
    return 'ok';
  } catch {
    return 'network';
  }
}

export type OtpVerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'network'
        | 'invalid_code'
        | 'invalid_phone'
        | 'phone_role_conflict'
        | 'server'
        | 'sms_not_configured'
        | 'sms_verify_failed';
    };

export async function exchangeOtpSession(
  phone: string,
  role: 'maid' | 'user',
  code: string
): Promise<OtpVerifyResult> {
  const digits = code.replace(/\D/g, '');
  if (digits.length < OTP_MIN_DIGITS) {
    return { ok: false, reason: 'invalid_code' };
  }
  if (!API_SYNC_ENABLED) {
    return { ok: true };
  }
  try {
    const res = await apiFetch(`${API_BASE_URL}/v1/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ phone, code: digits, role }),
    });
    const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
    if (!res.ok) {
      if (res.status === 400 && data.error === 'invalid_phone') {
        return { ok: false, reason: 'invalid_phone' };
      }
      if (res.status === 400 && data.error === 'invalid_code') {
        return { ok: false, reason: 'invalid_code' };
      }
      if (res.status === 409 && data.error === 'phone_role_conflict') {
        return { ok: false, reason: 'phone_role_conflict' };
      }
      if (res.status === 503 && data.error === 'sms_not_configured') {
        return { ok: false, reason: 'sms_not_configured' };
      }
      if (res.status === 502 && data.error === 'sms_verify_failed') {
        return { ok: false, reason: 'sms_verify_failed' };
      }
      return { ok: false, reason: 'server' };
    }
    if (!data.token) return { ok: false, reason: 'server' };
    await setApiToken(data.token);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export async function fetchMaidOwnListing(): Promise<MaidOwnProfile | null> {
  if (!API_SYNC_ENABLED) return null;
  const token = await getApiToken();
  if (!token) return null;
  try {
    const res = await apiFetch(`${API_BASE_URL}/v1/maids/me`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as { maid?: Record<string, unknown> };
    if (!data.maid || typeof data.maid !== 'object') return null;
    return apiMaidJsonToOwnProfile(data.maid);
  } catch {
    return null;
  }
}

export async function pushMaidProfile(profile: MaidOwnProfile): Promise<boolean> {
  if (!API_SYNC_ENABLED) return true;
  const token = await getApiToken();
  if (!token) return false;
  try {
    const res = await apiFetch(`${API_BASE_URL}/v1/maids/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        displayName: profile.displayName,
        phone: profile.phone,
        gender: profile.gender,
        age: profile.age,
        photoUri: profile.photoUri,
        rates: profile.rates,
        services: profile.services,
        verified: profile.verified,
        locationLat: profile.locationLat,
        locationLng: profile.locationLng,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function apiMaidToPublic(m: Record<string, unknown>): PublicMaid {
  const latRaw = m.lat;
  const lngRaw = m.lng;
  const lat =
    typeof latRaw === 'number' && Number.isFinite(latRaw)
      ? latRaw
      : latRaw != null && Number.isFinite(Number(latRaw))
        ? Number(latRaw)
        : null;
  const lng =
    typeof lngRaw === 'number' && Number.isFinite(lngRaw)
      ? lngRaw
      : lngRaw != null && Number.isFinite(Number(lngRaw))
        ? Number(lngRaw)
        : null;
  const servicesRaw = m.services;
  const services: ServiceId[] = Array.isArray(servicesRaw)
    ? (servicesRaw.filter((x) => typeof x === 'string') as ServiceId[])
    : [];
  const ratesRaw = m.rates as Record<string, unknown> | undefined;
  const m30 = Number(ratesRaw?.m30) || 0;
  const h1 = Number(ratesRaw?.h1) || 0;
  const h2 = Number(ratesRaw?.h2) || 0;
  let h24 = Number(ratesRaw?.h24) || 0;
  if (!(h24 > 0)) {
    h24 = Math.max(Math.round(h2 * 8), Math.round(h1 * 12));
  }
  const rates = { m30, h1, h2, h24 };
  const reviewsRaw = m.reviews;
  const reviews = Array.isArray(reviewsRaw) ? (reviewsRaw as PublicMaid['reviews']) : [];
  return {
    id: String(m.id ?? ''),
    displayName: String(m.displayName ?? ''),
    photoUri: m.photoUri != null ? String(m.photoUri) : null,
    gender: m.gender === 'male' || m.gender === 'female' ? (m.gender as Gender) : 'female',
    age: Number(m.age) || 18,
    distanceLabel: '—',
    rates,
    services,
    ratingAvg: Number(m.ratingAvg) || 0,
    reviewCount: Number(m.reviewCount) || 0,
    reviews,
    phone: String(m.phone ?? ''),
    lat,
    lng,
  };
}

export async function postMaidReviewToServer(
  maidId: string,
  body: {
    rating: number;
    comment: string;
    authorDisplayName: string;
    authorPhotoUri?: string | null;
  }
): Promise<PublicMaid | null> {
  if (!API_SYNC_ENABLED) return null;
  const token = await getApiToken();
  if (!token) return null;
  try {
    const res = await apiFetch(
      `${API_BASE_URL}/v1/maids/${encodeURIComponent(maidId)}/reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: body.rating,
          comment: body.comment,
          authorDisplayName: body.authorDisplayName,
          authorPhotoUri: body.authorPhotoUri ?? null,
        }),
      }
    );
    const data = (await res.json().catch(() => ({}))) as { maid?: Record<string, unknown> };
    if (!res.ok || !data.maid || typeof data.maid !== 'object') return null;
    return apiMaidToPublic(data.maid);
  } catch {
    return null;
  }
}

export async function fetchRemoteMaids(params?: {
  lat?: number;
  lng?: number;
  radiusKm?: number;
}): Promise<PublicMaid[] | null> {
  if (!API_SYNC_ENABLED) return null;
  try {
    const q = new URLSearchParams();
    if (params?.lat != null && Number.isFinite(params.lat)) q.set('lat', String(params.lat));
    if (params?.lng != null && Number.isFinite(params.lng)) q.set('lng', String(params.lng));
    if (params?.radiusKm != null && Number.isFinite(params.radiusKm)) {
      q.set('radiusKm', String(params.radiusKm));
    }
    const qs = q.toString();
    const url = qs ? `${API_BASE_URL}/v1/maids?${qs}` : `${API_BASE_URL}/v1/maids`;
    const res = await apiFetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as { maids?: unknown[] };
    const rows = Array.isArray(data.maids) ? data.maids : [];
    return rows.map((row) => apiMaidToPublic(row as Record<string, unknown>));
  } catch {
    return null;
  }
}
