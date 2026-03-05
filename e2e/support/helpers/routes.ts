import { env } from '../../../src/shared/config/env';

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const getRequestOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const appOrigin = getRequestOrigin(env.app.url);
const apiBaseUrl = normalizeBaseUrl(env.app.apiUrl);
const apiOrigin = getRequestOrigin(apiBaseUrl);
const useSameOriginApi = appOrigin !== null && apiOrigin !== null && appOrigin === apiOrigin;

export const buildApiRequestPath = (path: string): string =>
  useSameOriginApi ? path : `${apiBaseUrl}${path}`;

export const toTestPrefix = (testId: string): string =>
  testId
    .replace(/[^a-z0-9]/gi, '-')
    .slice(-40)
    .toLowerCase();
