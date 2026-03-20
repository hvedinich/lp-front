import { type ContactPlatform, PLATFORM_ENTRIES } from '@/entities/hostedPage';

interface PlatformInfo {
  platform: ContactPlatform;
  label: string;
}

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
