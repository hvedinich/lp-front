import { createHash } from 'node:crypto';

import { envTest } from '@/shared/config';

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const getRequestOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const appOrigin = getRequestOrigin(envTest.playwright.baseUrl);
const apiBaseUrl = normalizeBaseUrl(envTest.app.apiUrl);
const apiOrigin = getRequestOrigin(apiBaseUrl);
const useSameOriginApi = appOrigin !== null && apiOrigin !== null && appOrigin === apiOrigin;

export const buildApiRequestPath = (path: string): string =>
  useSameOriginApi ? path : `${apiBaseUrl}${path}`;

export const toTestPrefix = (testId: string): string =>
  createHash('sha1').update(testId).digest('hex').slice(0, 16);
