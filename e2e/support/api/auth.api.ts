import type { APIRequestContext, Page } from '@playwright/test';
import { env } from '../../../src/shared/config/env';
import type { AuthCredentials, BrowserResponse, SessionPayload } from '../contracts/backend.types';
import { loginSelectors } from '../helpers/selectors';
import { apiRequest, ensureOk, sleep } from './client.api';

const ensuredUserCache = new Map<string, AuthCredentials>();

const isManageRole = (role: string | undefined): boolean => role === 'owner' || role === 'admin';

const getSession = async (page: Page): Promise<BrowserResponse<SessionPayload>> => {
  return apiRequest<SessionPayload>(page.request, {
    method: 'GET',
    path: '/auth/me',
  });
};

const hasManageSession = async (page: Page): Promise<boolean> => {
  const session = await getSession(page);
  return session.ok && isManageRole(session.payload?.account?.role);
};

export const getE2ECredentials = (): AuthCredentials => ({
  email: env.playwright.e2eEmail,
  password: env.playwright.e2ePassword,
});

const withWorkerSuffix = (email: string, workerIndex: number): string => {
  const [localPart, domain = 'localprof.dev'] = email.split('@');
  return `${localPart}+e2e-w${workerIndex}@${domain}`;
};

const withWorkerScopeSuffix = (email: string, workerIndex: number, scope: string): string => {
  if (!scope) {
    return withWorkerSuffix(email, workerIndex);
  }

  const normalizedScope = scope
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 16);

  const [localPart, domain = 'localprof.dev'] = email.split('@');
  return `${localPart}+e2e-${normalizedScope}-w${workerIndex}@${domain}`;
};

export const getWorkerCredentials = (workerIndex: number, scope = ''): AuthCredentials => {
  const base = getE2ECredentials();
  return {
    email: withWorkerScopeSuffix(base.email, workerIndex, scope),
    password: base.password,
  };
};

export const clearAuthState = async (page: Page): Promise<void> => {
  await page.context().clearCookies();
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
};

const registerUser = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
): Promise<BrowserResponse> => {
  return apiRequest(request, {
    method: 'POST',
    path: '/auth/register',
    body: {
      email: credentials.email,
      password: credentials.password,
      language: 'en',
      name: 'Playwright E2E User',
      account: {
        name: 'Playwright E2E Account',
        region: 'PL',
        contentLanguage: 'en',
      },
    },
  });
};

export const loginViaApi = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
): Promise<BrowserResponse> => {
  return apiRequest(request, {
    method: 'POST',
    path: '/auth/login',
    body: {
      email: credentials.email,
      password: credentials.password,
    },
  });
};

const ensureRegisteredUser = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
): Promise<AuthCredentials> => {
  const firstAttempt = await registerUser(request, credentials);
  if (firstAttempt.ok || firstAttempt.status === 409) {
    return credentials;
  }

  if (firstAttempt.status >= 500) {
    await sleep(300);
    const retryAttempt = await registerUser(request, credentials);
    if (retryAttempt.ok || retryAttempt.status === 409) {
      return credentials;
    }
    ensureOk(retryAttempt, 'Unable to ensure deterministic E2E user');
  }

  ensureOk(firstAttempt, 'Unable to ensure deterministic E2E user');
  return credentials;
};

export const ensureE2EUser = async (
  request: APIRequestContext,
  workerIndex: number,
  scope = '',
): Promise<AuthCredentials> => {
  const cacheKey = `${scope || 'default'}:${workerIndex}`;
  const cached = ensuredUserCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const ensured = await ensureRegisteredUser(request, getWorkerCredentials(workerIndex, scope));
  ensuredUserCache.set(cacheKey, ensured);
  return ensured;
};

export const loginViaUi = async (page: Page, credentials: AuthCredentials): Promise<boolean> => {
  await page.goto('/login');

  if (!new URL(page.url()).pathname.startsWith('/login')) {
    return hasManageSession(page);
  }

  const { email, password, submit } = loginSelectors(page);
  if ((await submit.count()) === 0) {
    return hasManageSession(page);
  }

  await email.fill(credentials.email);
  await password.fill(credentials.password);
  await submit.click();
  await page.waitForLoadState('networkidle');

  return hasManageSession(page);
};

export const ensureAuthenticatedSession = async (
  page: Page,
  workerIndex: number,
): Promise<void> => {
  if (await hasManageSession(page)) {
    return;
  }

  await clearAuthState(page);
  const workerCredentials = await ensureE2EUser(page.request, workerIndex, 'locations');

  const apiLogin = await loginViaApi(page.request, workerCredentials);
  if (apiLogin.ok && (await hasManageSession(page))) {
    return;
  }

  if (await loginViaUi(page, workerCredentials)) {
    return;
  }

  const registered = await ensureRegisteredUser(page.request, workerCredentials);
  await clearAuthState(page);

  const apiLoginAfterRegister = await loginViaApi(page.request, registered);
  if (apiLoginAfterRegister.ok && (await hasManageSession(page))) {
    return;
  }

  if (await loginViaUi(page, registered)) {
    return;
  }

  throw new Error('Unable to establish owner/admin session for E2E.');
};
