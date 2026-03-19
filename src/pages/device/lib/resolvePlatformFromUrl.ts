import type { ContactPlatform } from '@/entities/hostedPage';

interface PlatformInfo {
  platform: ContactPlatform;
  label: string;
}

const PLATFORM_ENTRIES: Array<{ platform: ContactPlatform; label: string; pattern: RegExp }> = [
  { platform: 'google', label: 'Google', pattern: /(^|\.)google\.|^goo\.gl$|^g\.page$/i },
  { platform: 'facebook', label: 'Facebook', pattern: /(^|\.)facebook\.|^fb\.(com|me)$/i },
  { platform: 'yelp', label: 'Yelp', pattern: /(^|\.)yelp\./i },
  { platform: 'tripadvisor', label: 'Tripadvisor', pattern: /(^|\.)tripadvisor\./i },
  { platform: 'trustpilot', label: 'Trustpilot', pattern: /(^|\.)trustpilot\./i },
  { platform: 'autotrader', label: 'Autotrader', pattern: /(^|\.)autotrader\./i },
  { platform: 'fresha', label: 'Fresha', pattern: /(^|\.)fresha\./i },
  { platform: 'booksy', label: 'Booksy', pattern: /(^|\.)booksy\./i },
  { platform: 'instagram', label: 'Instagram', pattern: /(^|\.)instagram\./i },
  { platform: 'tiktok', label: 'TikTok', pattern: /(^|\.)tiktok\./i },
  { platform: 'youtube', label: 'YouTube', pattern: /(^|\.)youtube\.|^youtu\.be$/i },
  { platform: 'whatsapp', label: 'WhatsApp', pattern: /(^|\.)whatsapp\.|^wa\.me$/i },
  { platform: 'linkedin', label: 'LinkedIn', pattern: /(^|\.)linkedin\./i },
  { platform: 'pinterest', label: 'Pinterest', pattern: /(^|\.)pinterest\.|^pin\.it$/i },
  { platform: 'linktree', label: 'Linktree', pattern: /^linktr\.ee$/i },
  { platform: 'checkatrade', label: 'Checkatrade', pattern: /(^|\.)checkatrade\./i },
  { platform: 'treatwell', label: 'Treatwell', pattern: /(^|\.)treatwell\./i },
];

export const resolvePlatformFromUrl = (url: string): PlatformInfo | null => {
  try {
    const { hostname } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    for (const { platform, label, pattern } of PLATFORM_ENTRIES) {
      if (pattern.test(host)) {
        return { platform, label };
      }
    }
  } catch {
    // invalid URL
  }
  return null;
};
