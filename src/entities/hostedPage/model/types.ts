import { ContactPlatform } from '@/entities/_contracts';

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
