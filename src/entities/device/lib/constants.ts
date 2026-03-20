import { ContactPlatform } from '@/entities/hostedPage';

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
