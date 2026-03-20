import { ContactPlatform, ReviewPlatform } from '@/entities/_contracts';
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

export const PLATFORM_ENTRIES: Array<{
  platform: ContactPlatform;
  label: string;
  pattern: RegExp;
}> = [
  { platform: 'google', label: 'Google', pattern: PLATFORM_URL_PATTERNS.google! },
  { platform: 'facebook', label: 'Facebook', pattern: PLATFORM_URL_PATTERNS.facebook! },
  { platform: 'yelp', label: 'Yelp', pattern: PLATFORM_URL_PATTERNS.yelp! },
  { platform: 'tripadvisor', label: 'Tripadvisor', pattern: PLATFORM_URL_PATTERNS.tripadvisor! },
  { platform: 'trustpilot', label: 'Trustpilot', pattern: PLATFORM_URL_PATTERNS.trustpilot! },
  { platform: 'autotrader', label: 'Autotrader', pattern: PLATFORM_URL_PATTERNS.autotrader! },
  { platform: 'fresha', label: 'Fresha', pattern: PLATFORM_URL_PATTERNS.fresha! },
  { platform: 'booksy', label: 'Booksy', pattern: PLATFORM_URL_PATTERNS.booksy! },
  { platform: 'instagram', label: 'Instagram', pattern: PLATFORM_URL_PATTERNS.instagram! },
  { platform: 'tiktok', label: 'TikTok', pattern: PLATFORM_URL_PATTERNS.tiktok! },
  { platform: 'youtube', label: 'YouTube', pattern: PLATFORM_URL_PATTERNS.youtube! },
  { platform: 'whatsapp', label: 'WhatsApp', pattern: PLATFORM_URL_PATTERNS.whatsapp! },
  { platform: 'linkedin', label: 'LinkedIn', pattern: PLATFORM_URL_PATTERNS.linkedin! },
  { platform: 'pinterest', label: 'Pinterest', pattern: PLATFORM_URL_PATTERNS.pinterest! },
  { platform: 'linktree', label: 'Linktree', pattern: PLATFORM_URL_PATTERNS.linktree! },
  { platform: 'checkatrade', label: 'Checkatrade', pattern: PLATFORM_URL_PATTERNS.checkatrade! },
  { platform: 'treatwell', label: 'Treatwell', pattern: PLATFORM_URL_PATTERNS.treatwell! },
];
