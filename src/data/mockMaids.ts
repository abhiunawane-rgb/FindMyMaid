import type { MaidOwnProfile, PublicMaid, Review, ServiceId } from '../types';

const baseServices: ServiceId[] = [
  'house_cleaning',
  'cooking',
  'kitchen_utensils',
  'cloth_cleaning',
];

/** Fallback coordinates only when GPS fails in development — not shown to users as a “region”. */
export const MOCK_CENTER = { lat: 19.076, lng: 72.8777 };

/** Stable portrait URLs (HTTPS) for demo list + detail — RandomUser CDN works in Expo. */
const PORTRAITS = {
  m1: 'https://randomuser.me/api/portraits/women/65.jpg',
  m2: 'https://randomuser.me/api/portraits/women/32.jpg',
  m3: 'https://randomuser.me/api/portraits/women/47.jpg',
  m4: 'https://randomuser.me/api/portraits/women/68.jpg',
  m5: 'https://randomuser.me/api/portraits/men/32.jpg',
  m6: 'https://randomuser.me/api/portraits/women/22.jpg',
} as const;

/** Demo reviewer faces — varied HTTPS portraits for review rows. */
const REVIEWER_POOL = [
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/men/44.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/women/90.jpg',
  'https://randomuser.me/api/portraits/men/67.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/85.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/76.jpg',
  'https://randomuser.me/api/portraits/men/33.jpg',
  'https://randomuser.me/api/portraits/women/21.jpg',
  'https://randomuser.me/api/portraits/men/56.jpg',
  'https://randomuser.me/api/portraits/women/55.jpg',
  'https://randomuser.me/api/portraits/men/91.jpg',
] as const;

function enrichReviews(reviews: Review[]): Review[] {
  return reviews.map((r) => {
    const h = r.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return {
      ...r,
      authorPhotoUri: r.authorPhotoUri ?? REVIEWER_POOL[h % REVIEWER_POOL.length],
    };
  });
}

function summarizeReviews(reviews: Review[]): { ratingAvg: number; reviewCount: number } {
  if (reviews.length === 0) return { ratingAvg: 0, reviewCount: 0 };
  const sum = reviews.reduce((a, r) => a + r.rating, 0);
  return {
    ratingAvg: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

function maid(p: Omit<PublicMaid, 'ratingAvg' | 'reviewCount'> & { reviews: Review[] }): PublicMaid {
  const { reviews: raw, ...rest } = p;
  const reviews = enrichReviews(raw);
  const { ratingAvg, reviewCount } = summarizeReviews(reviews);
  return { ...rest, reviews, ratingAvg, reviewCount };
}

export const MOCK_MAIDS: PublicMaid[] = [
  maid({
    id: 'm1',
    displayName: 'Sunita K.',
    photoUri: PORTRAITS.m1,
    gender: 'female',
    distanceLabel: '—',
    rates: { m30: 200, h1: 350, h2: 600 },
    services: ['house_cleaning', 'kitchen_utensils', 'cooking'],
    phone: '+919876543210',
    lat: 19.0772,
    lng: 72.8781,
    reviews: [
      { id: 'm1-r1', author: 'Neha M.', rating: 5, comment: 'Deep cleaned the whole flat before Diwali. On time and brought her own supplies.' },
      { id: 'm1-r2', author: 'Rahul V.', rating: 5, comment: 'Kitchen was spotless. Very polite with elders at home.' },
      { id: 'm1-r3', author: 'Kavita S.', rating: 4, comment: 'Good work; would book again. Slightly late due to traffic but called ahead.' },
      { id: 'm1-r4', author: 'Aman P.', rating: 5, comment: 'Best helper we have tried on the app. Explained what she was doing clearly.' },
      { id: 'm1-r5', author: 'Priya L.', rating: 5, comment: 'Handled marble and glass carefully. Fair rates for the quality.' },
      { id: 'm1-r6', author: 'Suresh T.', rating: 4, comment: 'Solid cleaning. Bathroom tiles look new.' },
    ],
  }),
  maid({
    id: 'm2',
    displayName: 'Mary D.',
    photoUri: PORTRAITS.m2,
    gender: 'female',
    distanceLabel: '—',
    rates: { m30: 180, h1: 320, h2: 550 },
    services: ['cloth_cleaning', 'house_cleaning', 'other'],
    phone: '+919811122233',
    lat: 19.0755,
    lng: 72.8788,
    reviews: [
      { id: 'm2-r1', author: 'Asha R.', rating: 5, comment: 'Ironing and folding were hotel-level. Silk sarees handled with care.' },
      { id: 'm2-r2', author: 'Deepak K.', rating: 4, comment: 'Good with kids’ uniforms. Asked about starch preference.' },
      { id: 'm2-r3', author: 'Meera J.', rating: 5, comment: 'Picked up and dropped laundry when we were busy — lifesaver.' },
      { id: 'm2-r4', author: 'Nitin G.', rating: 5, comment: 'Honest about stains she could not fully remove. Appreciated that.' },
      { id: 'm2-r5', author: 'Sonal B.', rating: 4, comment: 'Very thorough; booking slot was tight but she accommodated.' },
    ],
  }),
  maid({
    id: 'm3',
    displayName: 'Priya S.',
    photoUri: PORTRAITS.m3,
    gender: 'female',
    distanceLabel: '—',
    rates: { m30: 220, h1: 400, h2: 700 },
    services: ['cooking', 'house_cleaning'],
    phone: '+919955501234',
    lat: 19.0768,
    lng: 72.8765,
    reviews: [
      { id: 'm3-r1', author: 'Vikram N.', rating: 5, comment: 'North Indian thali was excellent. Asked spice level first — family loved it.' },
      { id: 'm3-r2', author: 'Anita D.', rating: 5, comment: 'Left the kitchen cleaner than she found it. Professional.' },
      { id: 'm3-r3', author: 'Rohit C.', rating: 5, comment: 'Meal prep for the week saved us hours. Containers labelled clearly.' },
      { id: 'm3-r4', author: 'Fatima H.', rating: 4, comment: 'Tasty food; one dish was a bit salty for us but she adjusted next time.' },
      { id: 'm3-r5', author: 'Arjun S.', rating: 5, comment: 'On time, hygienic, and great with dietary notes we sent on WhatsApp.' },
      { id: 'm3-r6', author: 'Leena P.', rating: 5, comment: 'Festive menu ideas without overspending. Highly recommend.' },
    ],
  }),
  maid({
    id: 'm4',
    displayName: 'Geeta R.',
    photoUri: PORTRAITS.m4,
    gender: 'female',
    distanceLabel: '—',
    rates: { m30: 150, h1: 280, h2: 480 },
    services: baseServices,
    phone: '+919900011122',
    lat: 19.0748,
    lng: 72.8792,
    reviews: [
      { id: 'm4-r1', author: 'Pooja M.', rating: 4, comment: 'Budget-friendly and reliable for weekly dusting + mop.' },
      { id: 'm4-r2', author: 'Harish L.', rating: 4, comment: 'Good value. Communication in Hindi was easy for my parents.' },
      { id: 'm4-r3', author: 'Divya K.', rating: 5, comment: 'Helps with utensils and basic chopping when we need — flexible.' },
      { id: 'm4-r4', author: 'Imran S.', rating: 4, comment: 'Punctual. Asked to reschedule once with notice — no problem.' },
      { id: 'm4-r5', author: 'Sneha W.', rating: 4, comment: 'Straightforward rates, no surprises. Place felt tidy after visit.' },
    ],
  }),
  maid({
    id: 'm5',
    displayName: 'Joseph P.',
    photoUri: PORTRAITS.m5,
    gender: 'male',
    distanceLabel: '—',
    rates: { m30: 210, h1: 380, h2: 650 },
    services: ['house_cleaning', 'other', 'kitchen_utensils'],
    phone: '+919988776655',
    lat: 19.0775,
    lng: 72.877,
    reviews: [
      { id: 'm5-r1', author: 'Ritu A.', rating: 5, comment: 'Helped with post-renovation dust. Wore mask throughout — appreciated.' },
      { id: 'm5-r2', author: 'Manoj E.', rating: 5, comment: 'Moved light furniture safely before mopping. Detail-oriented.' },
      { id: 'm5-r3', author: 'Christina F.', rating: 4, comment: 'Great for deep clean; book in advance as he is popular.' },
      { id: 'm5-r4', author: 'Sameer Q.', rating: 5, comment: 'Explained which areas needed extra time — transparent billing.' },
    ],
  }),
  maid({
    id: 'm6',
    displayName: 'Lakshmi T.',
    photoUri: PORTRAITS.m6,
    gender: 'female',
    distanceLabel: '—',
    rates: { m30: 190, h1: 340, h2: 580 },
    services: ['cooking', 'kitchen_utensils', 'cloth_cleaning'],
    phone: '+919922334455',
    lat: 19.075,
    lng: 72.8775,
    reviews: [
      { id: 'm6-r1', author: 'Gauri N.', rating: 5, comment: 'South Indian breakfast spread was authentic. Idlis were fluffy.' },
      { id: 'm6-r2', author: 'Vivek O.', rating: 4, comment: 'Good combo of cooking + kitchen cleanup in one visit.' },
      { id: 'm6-r3', author: 'Zara K.', rating: 5, comment: 'Respectful of our kitchen rules (veg only). Very neat worker.' },
      { id: 'm6-r4', author: 'Omkar R.', rating: 5, comment: 'Ironed shirts perfectly for office week. Will rebook monthly.' },
      { id: 'm6-r5', author: 'Bhavna S.', rating: 4, comment: 'Minor delay once; otherwise five stars for quality.' },
    ],
  }),
];

export const DEMO_MAID_IDS = new Set(MOCK_MAIDS.map((m) => m.id));

/** Demo listings do not consume lead limits (sample data for browsing). */
export function isDemoMaidId(id: string): boolean {
  return DEMO_MAID_IDS.has(id);
}

function toRad(n: number) {
  return (n * Math.PI) / 180;
}

/** Haversine distance in km */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Demo helpers: fixed distances 0.5–5 km around the user so listings always read “nearby”. */
const DEMO_RING_KM = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

/** Destination point from (lat,lng) after moving `km` on Earth surface at bearing (0=N, 90=E). */
export function pointAtBearingKm(lat: number, lng: number, km: number, bearingDeg: number) {
  const R = 6371;
  const δ = km / R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lng * Math.PI) / 180;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );
  return { lat: (φ2 * 180) / Math.PI, lng: (λ2 * 180) / Math.PI };
}

function hasFinitePair(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  );
}

/** Publish a completed helper setup into the in-app discovery feed (AsyncStorage-backed; no server yet). */
export function maidOwnProfileToPublic(m: MaidOwnProfile): PublicMaid {
  const hasLoc = hasFinitePair(m.locationLat, m.locationLng);
  return {
    id: m.id,
    displayName: m.displayName,
    photoUri: m.photoUri,
    gender: m.gender,
    distanceLabel: '—',
    rates: m.rates,
    services: m.services,
    phone: m.phone,
    lat: hasLoc ? m.locationLat! : null,
    lng: hasLoc ? m.locationLng! : null,
    ratingAvg: 0,
    reviewCount: 0,
    reviews: [],
  };
}

export function formatDistanceLabel(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function withDistances(
  maids: PublicMaid[],
  user: { lat: number; lng: number } | null
): PublicMaid[] {
  if (!user) {
    return maids.map((m) => ({ ...m, distanceLabel: 'Nearby', distanceKm: undefined }));
  }
  const placed = maids.map((m, index) => {
    let lat = m.lat;
    let lng = m.lng;
    if (isDemoMaidId(m.id)) {
      const kmRing = DEMO_RING_KM[index % DEMO_RING_KM.length];
      const bearing = (index * 47 + 23) % 360;
      const p = pointAtBearingKm(user.lat, user.lng, kmRing, bearing);
      lat = p.lat;
      lng = p.lng;
    }
    if (!hasFinitePair(lat, lng)) {
      return {
        ...m,
        lat,
        lng,
        distanceKm: undefined,
        distanceLabel: 'Area not shared',
      };
    }
    const km = distanceKm(user, { lat: lat as number, lng: lng as number });
    return {
      ...m,
      lat,
      lng,
      distanceKm: km,
      distanceLabel: formatDistanceLabel(km),
    };
  });
  return [...placed].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}
