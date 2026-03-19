import type { ContactPlatform, ReviewPlatform } from '@/entities/hostedPage';
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
import type { IconProps } from '@chakra-ui/react';
import type { FC } from 'react';

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

export const PLATFORM_URL_PATTERNS: Partial<Record<ContactPlatform, RegExp>> = {
  google: /(^|\.)google\.|^goo\.gl$|^g\.page$/i,
  facebook: /(^|\.)facebook\.|^fb\.(com|me)$/i,
  yelp: /(^|\.)yelp\./i,
  tripadvisor: /(^|\.)tripadvisor\./i,
  trustpilot: /(^|\.)trustpilot\./i,
  autotrader: /(^|\.)autotrader\./i,
  fresha: /(^|\.)fresha\./i,
  booksy: /(^|\.)booksy\./i,
  instagram: /(^|\.)instagram\./i,
  tiktok: /(^|\.)tiktok\./i,
  youtube: /(^|\.)youtube\.|^youtu\.be$/i,
  whatsapp: /(^|\.)whatsapp\.|^wa\.me$/i,
  linkedin: /(^|\.)linkedin\./i,
  pinterest: /(^|\.)pinterest\.|^pin\.it$/i,
  linktree: /^linktr\.ee$/i,
  checkatrade: /(^|\.)checkatrade\./i,
  treatwell: /(^|\.)treatwell\./i,
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

export const getPlatformLabel = (platform: string): string =>
  platform.charAt(0).toUpperCase() + platform.slice(1);
