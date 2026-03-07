import { env } from '../../../src/shared/config/env';

const normalizeBaseUrl = (value: string): string => value.trim().replace(/\/$/, '');

export const isLocalUrl = (value: string): boolean => {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export const resolveE2EBaseUrl = (): string => {
  const explicitBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

  if (!explicitBaseUrl) {
    return env.app.url;
  }

  try {
    return normalizeBaseUrl(new URL(explicitBaseUrl).toString());
  } catch {
    throw new Error(
      `[config] Invalid PLAYWRIGHT_BASE_URL: "${explicitBaseUrl}". Expected an absolute URL.`,
    );
  }
};
