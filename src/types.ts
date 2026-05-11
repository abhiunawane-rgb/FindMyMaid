export type UserRole = 'maid' | 'user';

export type Gender = 'male' | 'female';

export type ServiceId =
  | 'cooking'
  | 'house_cleaning'
  | 'kitchen_utensils'
  | 'cloth_cleaning'
  | 'other';

export const SERVICE_LABELS: Record<ServiceId, string> = {
  cooking: 'Cooking',
  house_cleaning: 'House cleaning',
  kitchen_utensils: 'Kitchen utensils cleaning',
  cloth_cleaning: 'Cloth washing & ironing',
  other: 'Other household help',
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  /** Reviewer profile image URL when available (demo uses placeholder portraits). */
  authorPhotoUri?: string | null;
};

export type PublicMaid = {
  id: string;
  displayName: string;
  photoUri: string | null;
  gender: Gender;
  age: number;
  /** Approximate distance label, e.g. "1.2 km" */
  distanceLabel: string;
  /** km from user when location is on; used for sorting */
  distanceKm?: number;
  rates: { m30: number; h1: number; h2: number; h24: number };
  services: ServiceId[];
  ratingAvg: number;
  reviewCount: number;
  reviews: Review[];
  phone: string;
  /**
   * Approximate work-area coordinates when the helper shared location at signup.
   * Null until location is shared — distance sorting stays meaningful for other listings.
   */
  lat: number | null;
  lng: number | null;
};

export type MaidOwnProfile = {
  /** Stable id for leads + subscription (e.g. maid_9876543210) */
  id: string;
  displayName: string;
  phone: string;
  gender: Gender;
  age: number;
  photoUri: string | null;
  rates: { m30: number; h1: number; h2: number; h24: number };
  services: ServiceId[];
  verified: boolean;
  /** Current device location at profile save — used so nearby families see real distance. */
  locationLat?: number;
  locationLng?: number;
};

export type UserOwnProfile = {
  displayName: string;
  /** Split name for editing; combined into displayName when saved. */
  firstName?: string;
  lastName?: string;
  phone: string;
  gender: Gender;
  city?: string;
  photoUri?: string | null;
};

/** Full display name from first + last, falling back to legacy displayName. */
export function buildDisplayNameFromUserParts(p: {
  firstName?: string | null;
  lastName?: string | null;
  displayName: string;
}): string {
  const f = p.firstName?.trim() ?? '';
  const l = p.lastName?.trim() ?? '';
  const combined = [f, l].filter(Boolean).join(' ');
  return combined || p.displayName.trim();
}
