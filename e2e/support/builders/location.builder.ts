import { envTest } from '@/shared/config';

const TEST_LOCATION_PREFIX = envTest.playwright.locationPrefix;

export const buildLocationSeedNames = (testPrefix: string) => {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const prefix = `${TEST_LOCATION_PREFIX}-${testPrefix}-${token}`.slice(0, 40);

  return {
    defaultName: `${prefix}-D`,
    secondaryName: `${prefix}-S`,
    defaultSlug: `pw-${testPrefix.slice(0, 12)}-d-${Math.random().toString(36).slice(2, 7)}`,
    secondarySlug: `pw-${testPrefix.slice(0, 12)}-s-${Math.random().toString(36).slice(2, 7)}`,
  };
};

export const toLocationSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
