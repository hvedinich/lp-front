import type { APIRequestContext, Page } from '@playwright/test';
import { env } from '../../../src/shared/config/env';
import type { AuthCredentials, BrowserResponse, SessionPayload } from '../contracts/backend.types';
import { loginSelectors } from '../helpers/selectors';
import { apiRequest, ensureOk, sleep, toApiError } from './client.api';

const ensuredUserCache = new Map<string, AuthCredentials>();
const AUTH_RETRY_DELAYS_MS = [200, 500, 1000, 2000] as const;
const MIN_LOGIN_GAP_MS = 400;
let loginQueue: Promise<void> = Promise.resolve();
let lastLoginAt = 0;

const isManageRole = (role: string | undefined): boolean => role === 'owner' || role === 'admin';
const isTransientStatus = (status: number): boolean => status >= 500;
const shouldRetry = (attempt: number): boolean => attempt < AUTH_RETRY_DELAYS_MS.length;
const toJitterMs = (baseDelayMs: number): number => baseDelayMs + Math.floor(Math.random() * 151);

const logAuthBootstrap = (
  level: 'warn' | 'error',
  event: string,
  details: Record<string, unknown>,
): void => {
  const payload = {
    component: 'e2e-auth-bootstrap',
    event,
    ...details,
  };
  console[level](`[e2e] ${JSON.stringify(payload)}`);
};

const parseRetryAfterSeconds = (response: BrowserResponse): number | null => {
  const payload = response.payload as { error?: { code?: string; message?: string } } | null;
  const code = payload?.error?.code;
  if (code !== 'RATE_LIMITED') {
    return null;
  }

  const message = payload?.error?.message ?? '';
  const match = message.match(/retry after (\d+) seconds?/i);
  if (!match) {
    return null;
  }

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
};

const serializedLoginRequest = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
): Promise<BrowserResponse> => {
  const previous = loginQueue;
  let release: () => void = () => {};
  loginQueue = new Promise((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    const now = Date.now();
    const delta = now - lastLoginAt;
    if (delta < MIN_LOGIN_GAP_MS) {
      await sleep(MIN_LOGIN_GAP_MS - delta);
    }
    const response = await loginViaApi(request, credentials);
    lastLoginAt = Date.now();
    return response;
  } finally {
    release();
  }
};

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

const loginViaApiWithRetry = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
  context: { scope: string; workerIndex: number },
): Promise<BrowserResponse> => {
  let attempt = 0;

  while (true) {
    const response = await serializedLoginRequest(request, credentials);
    if (response.ok) {
      return response;
    }

    const retryAfterSeconds = parseRetryAfterSeconds(response);
    if (retryAfterSeconds !== null && shouldRetry(attempt)) {
      const delayMs = toJitterMs(retryAfterSeconds * 1000);
      logAuthBootstrap('warn', 'login-rate-limited-retry', {
        attempt: attempt + 1,
        code: (response.payload as { error?: { code?: string } } | null)?.error?.code ?? 'UNKNOWN',
        delayMs,
        scope: context.scope || 'default',
        status: response.status,
        workerIndex: context.workerIndex,
      });
      await sleep(delayMs);
      attempt += 1;
      continue;
    }

    if (!isTransientStatus(response.status) || !shouldRetry(attempt)) {
      return response;
    }

    const delayStepMs = AUTH_RETRY_DELAYS_MS[attempt] ?? AUTH_RETRY_DELAYS_MS.at(-1)!;
    const delayMs = toJitterMs(delayStepMs);
    logAuthBootstrap('warn', 'login-transient-retry', {
      attempt: attempt + 1,
      code: (response.payload as { error?: { code?: string } } | null)?.error?.code ?? 'UNKNOWN',
      delayMs,
      scope: context.scope || 'default',
      status: response.status,
      workerIndex: context.workerIndex,
    });
    await sleep(delayMs);
    attempt += 1;
  }
};

const ensureRegisteredUser = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
  context: { scope: string; workerIndex: number },
): Promise<AuthCredentials> => {
  let attempt = 0;
  while (true) {
    const registerResponse = await registerUser(request, credentials);
    if (registerResponse.ok || registerResponse.status === 409) {
      return credentials;
    }

    if (!isTransientStatus(registerResponse.status) || !shouldRetry(attempt)) {
      ensureOk(registerResponse, 'Unable to ensure deterministic E2E user');
      return credentials;
    }

    const delayStepMs = AUTH_RETRY_DELAYS_MS[attempt] ?? AUTH_RETRY_DELAYS_MS.at(-1)!;
    const delayMs = toJitterMs(delayStepMs);
    logAuthBootstrap('warn', 'register-transient-retry', {
      attempt: attempt + 1,
      code:
        (registerResponse.payload as { error?: { code?: string } } | null)?.error?.code ??
        'UNKNOWN',
      delayMs,
      scope: context.scope || 'default',
      status: registerResponse.status,
      workerIndex: context.workerIndex,
    });
    await sleep(delayMs);
    attempt += 1;
  }
};

const shouldRegisterAfterLoginFailure = (response: BrowserResponse): boolean =>
  response.status === 401 || response.status === 404;

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

  const credentials = getWorkerCredentials(workerIndex, scope);
  const context = {
    scope: scope || 'default',
    workerIndex,
  };

  await ensureRegisteredUser(request, credentials, context);
  const ensured = credentials;
  ensuredUserCache.set(cacheKey, ensured);
  return ensured;
};

export const ensureAuthenticatedE2EUser = async (
  request: APIRequestContext,
  workerIndex: number,
  scope = '',
): Promise<AuthCredentials> => {
  const credentials = await ensureE2EUser(request, workerIndex, scope);
  const context = {
    scope: scope || 'default',
    workerIndex,
  };

  const loginResponse = await loginViaApiWithRetry(request, credentials, context);
  if (!loginResponse.ok) {
    if (shouldRegisterAfterLoginFailure(loginResponse)) {
      await ensureRegisteredUser(request, credentials, context);
      const loginAfterRegister = await loginViaApiWithRetry(request, credentials, context);
      if (!loginAfterRegister.ok) {
        logAuthBootstrap('error', 'login-after-register-failed', {
          code:
            (loginAfterRegister.payload as { error?: { code?: string } } | null)?.error?.code ??
            'UNKNOWN',
          error: toApiError(loginAfterRegister),
          scope: context.scope,
          status: loginAfterRegister.status,
          workerIndex: context.workerIndex,
        });
        ensureOk(loginAfterRegister, 'Unable to ensure deterministic E2E user');
      }
      return credentials;
    }

    logAuthBootstrap('error', 'login-failed-without-register-fallback', {
      code:
        (loginResponse.payload as { error?: { code?: string } } | null)?.error?.code ?? 'UNKNOWN',
      error: toApiError(loginResponse),
      scope: context.scope,
      status: loginResponse.status,
      workerIndex: context.workerIndex,
    });
    ensureOk(loginResponse, 'Unable to ensure deterministic E2E user');
  }

  return credentials;
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
  const workerCredentials = await ensureAuthenticatedE2EUser(
    page.request,
    workerIndex,
    'locations',
  );
  if (await hasManageSession(page)) {
    return;
  }

  if (await loginViaUi(page, workerCredentials)) {
    return;
  }

  throw new Error('Unable to establish owner/admin session for E2E.');
};
