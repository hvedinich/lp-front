import {
  AutotraderIcon,
  BookingsIcon,
  BooksyIcon,
  CalendarIcon,
  CheckaTradeIcon,
  ChefHatIcon,
  FacebookOfficialIcon,
  FreshaIcon,
  GoogleOfficialIcon,
  InstagramIcon,
  LinkedInIcon,
  LinkTreeIcon,
  PinterestIcon,
  TikTokIcon,
  TreatwellIcon,
  TripAdvisorIcon,
  TrustpilotIcon,
  WhatsAppIcon,
  YelpBurstIcon,
  YouTubeIcon,
} from '@/shared/ui';
import { IconProps } from '@chakra-ui/react';
import { FC } from 'react';
import { ContactPlatform, ReviewPlatform } from '../model/types';

export const PLATFORM_ICON: Record<ContactPlatform, FC<IconProps>> = {
  google: GoogleOfficialIcon,
  facebook: FacebookOfficialIcon,
  yelp: YelpBurstIcon,
  tripadvisor: TripAdvisorIcon,
  trustpilot: TrustpilotIcon,
  autotrader: AutotraderIcon,
  fresha: FreshaIcon,
  booksy: BooksyIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
  linkedin: LinkedInIcon,
  pinterest: PinterestIcon,
  linktree: LinkTreeIcon,
  checkatrade: CheckaTradeIcon,
  treatwell: TreatwellIcon,
  menu: ChefHatIcon,
  bookings: BookingsIcon,
  appointment: CalendarIcon,
};

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
