import type { ContactPlatform, ReviewPlatform } from '@/entities/hostedPage';

export const REVIEW_PLATFORMS: ReviewPlatform[] = [
  'google',
  'facebook',
  'yelp',
  'tripadvisor',
  'trustpilot',
  'autotrader',
  'fresha',
  'booksy',
];

export const SOCIAL_MEDIA_PLATFORMS: ContactPlatform[] = [
  'instagram',
  'tiktok',
  'youtube',
  'whatsapp',
  'linkedin',
  'pinterest',
  'linktree',
  'checkatrade',
  'treatwell',
];

export const CUSTOM_PLATFORMS: ContactPlatform[] = ['menu', 'bookings', 'appointment'];

export const ALL_PLATFORMS: ContactPlatform[] = [
  ...REVIEW_PLATFORMS,
  ...SOCIAL_MEDIA_PLATFORMS,
  ...CUSTOM_PLATFORMS,
];
