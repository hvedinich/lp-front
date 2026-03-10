export type ReviewPlatform =
  | 'google'
  | 'facebook'
  | 'yelp'
  | 'tripadvisor'
  | 'trustpilot'
  | 'autotrader'
  | 'fresha'
  | 'booksy';

export type ContactPlatform =
  | ReviewPlatform
  | 'tiktok'
  | 'youtube'
  | 'instagram'
  | 'whatsapp'
  | 'linkedin'
  | 'pinterest'
  | 'linktree'
  | 'checkatrade'
  | 'treatwell'
  | 'menu'
  | 'appointment'
  | 'bookings';

export interface PlatformLink {
  type: ContactPlatform;
  url: string;
}
