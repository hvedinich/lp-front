interface PublishedConfigValueDTO {
  links?: string;
  [key: string]: string | undefined;
}
export interface HostedPageDTO {
  id: string;
  accountId: string;
  locationId: string;
  publishedConfig: PublishedConfigValueDTO;
  createdAt: string;
  updatedAt: string;
}

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
