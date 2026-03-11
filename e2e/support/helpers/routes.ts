import { createHash } from 'node:crypto';
import { testEnv } from '../config/env';
import { resolveE2EBaseUrl } from './base-url';

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const getRequestOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const appOrigin = getRequestOrigin(resolveE2EBaseUrl());
const apiBaseUrl = normalizeBaseUrl(testEnv.app.apiUrl);
const apiOrigin = getRequestOrigin(apiBaseUrl);
const useSameOriginApi = appOrigin !== null && apiOrigin !== null && appOrigin === apiOrigin;

export const buildApiRequestPath = (path: string): string =>
  useSameOriginApi ? path : `${apiBaseUrl}${path}`;

export const toTestPrefix = (testId: string): string =>
  createHash('sha1').update(testId).digest('hex').slice(0, 16);
