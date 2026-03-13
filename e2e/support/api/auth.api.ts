import type { APIRequestContext, Page } from '@playwright/test';
import { createHash, randomBytes } from 'node:crypto';
import type { AuthCredentials, BrowserResponse, SessionPayload } from '../contracts/backend.types';
import { fillLoginForm, openLoginPage } from '../helpers/auth-screen';
import { trackE2EUser, untrackE2EUser } from './auth-registry';
import { parseRetryAfterSeconds, runSharedLoginAttempt } from './auth-rate-limit';
import { apiRequest, ensureOk, sleep, toApiError } from './client.api';
import { envTest } from '@/shared/config';

const ensuredUserCache = new Map<string, AuthCredentials>();
const AUTH_RETRY_DELAYS_MS = [300, 700, 1500, 3000, 5000, 8000] as const;
const MAX_AUTH_RATE_LIMIT_WAIT_MS = 10_000;

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

const serializedLoginRequest = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
): Promise<BrowserResponse> => {
  return runSharedLoginAttempt(() => loginViaApi(request, credentials));
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

const forgetCachedCredentials = (email: string): void => {
  for (const [cacheKey, credentials] of ensuredUserCache.entries()) {
    if (credentials.email === email) {
      ensuredUserCache.delete(cacheKey);
    }
  }
};

const markTrackedUserRemoved = async (email: string): Promise<void> => {
  forgetCachedCredentials(email);
  await untrackE2EUser(email);
};

interface CleanupOptions {
  allowLoginFallback?: boolean;
}

export const getE2ECredentials = (): AuthCredentials => ({
  email: envTest.playwright.e2eEmail,
  password: envTest.playwright.e2ePassword,
});

const LOCAL_RUN_SCOPE = randomBytes(6).toString('hex');

const normalizeScopePart = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
};

const resolveE2EUserScope = (): string => {
  const explicitScope = normalizeScopePart(envTest.playwright.scope ?? '');
  if (explicitScope) {
    return explicitScope;
  }

  return envTest.playwright.isCi ? '' : LOCAL_RUN_SCOPE;
};

const toCredentialKey = (scope: string, workerIndex: number): string => {
  const basis = scope || `worker-${workerIndex}`;
  return createHash('sha1').update(basis).digest('hex').slice(0, 12);
};

const withScopedSuffix = (email: string, scope: string, workerIndex: number): string => {
  const [localPart, domain = 'localprof.dev'] = email.split('@');
  const credentialKey = toCredentialKey(scope, workerIndex);
  if (!scope) {
    return `${localPart}+e2e-${credentialKey}@${domain}`;
  }

  return `${localPart}+e2e-${scope}-${credentialKey}@${domain}`;
};

const buildE2EAccountName = (credentials: AuthCredentials): string => {
  const accountKey = createHash('sha1').update(credentials.email).digest('hex').slice(0, 12);
  return `Playwright E2E ${accountKey}`;
};

const buildRecoveryCredentials = (
  workerIndex: number,
  scope: string,
  attempt: number,
): AuthCredentials => {
  const recoveryScope = [scope, 'recovery', `${attempt}-${randomBytes(3).toString('hex')}`]
    .filter(Boolean)
    .join('-');

  return getWorkerCredentials(workerIndex, recoveryScope);
};

export const getWorkerCredentials = (workerIndex: number, scope = ''): AuthCredentials => {
  const base = getE2ECredentials();
  const deploymentScope = resolveE2EUserScope();
  const localScope = normalizeScopePart(scope);
  const scopedSuffix = [deploymentScope, localScope].filter(Boolean).join('-');

  return {
    email: withScopedSuffix(base.email, scopedSuffix, workerIndex),
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
      name: `Playwright ${credentials.email.split('@')[0]}`,
      account: {
        name: buildE2EAccountName(credentials),
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

const getCurrentSession = async (
  request: APIRequestContext,
): Promise<BrowserResponse<SessionPayload>> => {
  return apiRequest<SessionPayload>(request, {
    method: 'GET',
    path: '/auth/me',
  });
};

const deleteAccountById = async (request: APIRequestContext, accountId: string): Promise<void> => {
  const deleteResponse = await apiRequest(request, {
    method: 'DELETE',
    path: `/accounts/${accountId}`,
  });

  if (!deleteResponse.ok && deleteResponse.status !== 404) {
    throw new Error(`Unable to delete E2E account. ${toApiError(deleteResponse)}`);
  }
};

const deleteUserById = async (request: APIRequestContext, userId: string): Promise<void> => {
  const deleteResponse = await apiRequest(request, {
    method: 'DELETE',
    path: `/users/${userId}`,
  });

  if (!deleteResponse.ok && deleteResponse.status !== 404) {
    throw new Error(`Unable to delete E2E user. ${toApiError(deleteResponse)}`);
  }
};

const deleteCurrentUser = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
): Promise<void> => {
  const sessionResponse = await getCurrentSession(request);

  if (!sessionResponse.ok) {
    throw new Error(
      `Unable to load current E2E user before cleanup. ${toApiError(sessionResponse)}`,
    );
  }

  const userId = sessionResponse.payload?.user?.id;
  const accountId = sessionResponse.payload?.account?.id;
  if (!userId) {
    throw new Error('Unable to resolve current E2E user id before cleanup.');
  }
  if (!accountId) {
    throw new Error('Unable to resolve current E2E account id before cleanup.');
  }

  await deleteAccountById(request, accountId);

  const deleteUserResponse = await apiRequest(request, {
    method: 'DELETE',
    path: `/users/${userId}`,
  });

  if (deleteUserResponse.ok || deleteUserResponse.status === 404) {
    return;
  }

  if (deleteUserResponse.status !== 401) {
    throw new Error(`Unable to delete E2E user. ${toApiError(deleteUserResponse)}`);
  }

  const reloginResponse = await loginViaApi(request, credentials);
  if (reloginResponse.status === 401 || reloginResponse.status === 404) {
    return;
  }

  ensureOk(reloginResponse, 'Unable to re-authenticate E2E user after account cleanup');
  await deleteUserById(request, userId);
};

export const cleanupE2EUser = async (
  request: APIRequestContext,
  credentials: AuthCredentials,
  options: CleanupOptions = {},
): Promise<void> => {
  const allowLoginFallback = options.allowLoginFallback ?? true;
  const sessionResponse = await getCurrentSession(request);

  if (sessionResponse.ok) {
    try {
      await deleteCurrentUser(request, credentials);
    } finally {
      await markTrackedUserRemoved(credentials.email);
    }
    return;
  }

  if (!allowLoginFallback && (sessionResponse.status === 401 || sessionResponse.status === 404)) {
    await markTrackedUserRemoved(credentials.email);
    return;
  }

  const loginResponse = await serializedLoginRequest(request, credentials);

  if (loginResponse.status === 401 || loginResponse.status === 404) {
    await markTrackedUserRemoved(credentials.email);
    return;
  }

  ensureOk(loginResponse, 'Unable to authenticate E2E user for cleanup');

  try {
    await deleteCurrentUser(request, credentials);
  } finally {
    await markTrackedUserRemoved(credentials.email);
  }
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
      if (delayMs > MAX_AUTH_RATE_LIMIT_WAIT_MS) {
        logAuthBootstrap('error', 'login-rate-limited-fail-fast', {
          attempt: attempt + 1,
          code:
            (response.payload as { error?: { code?: string } } | null)?.error?.code ?? 'UNKNOWN',
          delayMs,
          scope: context.scope || 'default',
          status: response.status,
          workerIndex: context.workerIndex,
        });

        throw new Error(
          `Auth login rate limited for ${delayMs}ms during E2E bootstrap; failing fast instead of waiting.`,
        );
      }

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
  let recoveryAttempt = 0;
  while (true) {
    const registerResponse = await registerUser(request, credentials);
    if (registerResponse.ok) {
      return credentials;
    }

    if (registerResponse.status === 409) {
      const loginResponse = await loginViaApiWithRetry(request, credentials, context);
      if (loginResponse.ok) {
        return credentials;
      }

      const recoveryCredentials = buildRecoveryCredentials(
        context.workerIndex,
        context.scope,
        recoveryAttempt + 1,
      );
      recoveryAttempt += 1;

      logAuthBootstrap('warn', 'register-conflict-recovery', {
        attemptedEmail: credentials.email,
        code:
          (loginResponse.payload as { error?: { code?: string } } | null)?.error?.code ?? 'UNKNOWN',
        recoveryEmail: recoveryCredentials.email,
        scope: context.scope,
        status: loginResponse.status,
        workerIndex: context.workerIndex,
      });

      return ensureRegisteredUser(request, recoveryCredentials, {
        ...context,
        scope: `${context.scope}-recovery-${recoveryAttempt}`,
      });
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

  const ensured = await ensureRegisteredUser(request, credentials, context);
  ensuredUserCache.set(cacheKey, ensured);
  await trackE2EUser(ensured);
  return ensured;
};

const shouldRegisterAfterLoginFailure = (response: BrowserResponse): boolean =>
  response.status === 401 || response.status === 404;

export const ensureAuthenticatedE2EUser = async (
  request: APIRequestContext,
  workerIndex: number,
  scope = '',
): Promise<AuthCredentials> => {
  const cacheKey = `${scope || 'default'}:${workerIndex}`;
  const credentials = await ensureE2EUser(request, workerIndex, scope);
  const context = {
    scope: scope || 'default',
    workerIndex,
  };

  const loginResponse = await loginViaApiWithRetry(request, credentials, context);
  if (!loginResponse.ok) {
    if (shouldRegisterAfterLoginFailure(loginResponse)) {
      const registeredCredentials = await ensureRegisteredUser(request, credentials, context);
      const loginAfterRegister = await loginViaApiWithRetry(
        request,
        registeredCredentials,
        context,
      );
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
      return registeredCredentials;
    }

    logAuthBootstrap('error', 'login-failed-without-register-fallback', {
      code:
        (loginResponse.payload as { error?: { code?: string } } | null)?.error?.code ?? 'UNKNOWN',
      error: toApiError(loginResponse),
      scope: context.scope,
      status: loginResponse.status,
      workerIndex: context.workerIndex,
    });

    const recoveryContext = {
      ...context,
      scope: `${context.scope}-login-recovery`,
    };
    const recoveryCredentials = buildRecoveryCredentials(
      context.workerIndex,
      recoveryContext.scope,
      1,
    );
    const registeredRecovery = await ensureRegisteredUser(
      request,
      recoveryCredentials,
      recoveryContext,
    );
    const recoveryLoginResponse = await loginViaApiWithRetry(
      request,
      registeredRecovery,
      recoveryContext,
    );

    if (recoveryLoginResponse.ok) {
      ensuredUserCache.set(cacheKey, registeredRecovery);
      return registeredRecovery;
    }

    ensureOk(recoveryLoginResponse, 'Unable to ensure deterministic E2E user');
  }

  return credentials;
};

export const loginViaUi = async (page: Page, credentials: AuthCredentials): Promise<boolean> => {
  await openLoginPage(page);

  if (!new URL(page.url()).pathname.startsWith('/login')) {
    return hasManageSession(page);
  }

  const submit = page.getByRole('button', { name: 'Log In' });
  if ((await submit.count()) === 0) {
    return hasManageSession(page);
  }

  await fillLoginForm(page, credentials);
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
