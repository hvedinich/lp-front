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

interface PublishedConfigValue {
  links?: PlatformLink[];
  [key: string]: string | PlatformLink[] | undefined;
}

export interface HostedPage {
  id: string;
  accountId: string;
  locationId: string;
  publishedConfig: PublishedConfigValue;
  createdAt: string;
  updatedAt: string;
}
