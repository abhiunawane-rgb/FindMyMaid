import type { Gender } from '../types';

const FEMALE_PROFILE_PLACEHOLDER = 'https://randomuser.me/api/portraits/women/79.jpg';
const MALE_PROFILE_PLACEHOLDER = 'https://randomuser.me/api/portraits/men/79.jpg';

export function profilePlaceholderByGender(gender: Gender): string {
  return gender === 'male' ? MALE_PROFILE_PLACEHOLDER : FEMALE_PROFILE_PLACEHOLDER;
}

/**
 * Helper profile image for list/detail. Remote listings should use https; local picks still use file/content on this device.
 */
export function helperProfileImageSource(
  uri: string | null | undefined,
  gender: Gender
): { uri: string } {
  const t = uri?.trim() ?? '';
  if (!t) return { uri: profilePlaceholderByGender(gender) };
  const lower = t.toLowerCase();
  if (lower.startsWith('https://') || lower.startsWith('http://')) return { uri: t };
  if (
    lower.startsWith('file://') ||
    lower.startsWith('content://') ||
    lower.startsWith('ph://') ||
    lower.startsWith('phasset:') ||
    lower.startsWith('assets-library:')
  ) {
    return { uri: t };
  }
  return { uri: profilePlaceholderByGender(gender) };
}
