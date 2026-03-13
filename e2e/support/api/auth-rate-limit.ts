import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { sleep } from './client.api';
import { envTest } from '@/shared/config';

export interface SharedLoginResponse {
  headers?: Record<string, string>;
  payload?: unknown;
  status: number;
}

interface SharedLoginState {
  lastLoginAt: number;
  nextAllowedAt: number;
}

const AUTH_LOGIN_LOCK_PATH = join(tmpdir(), 'lp-front-e2e-auth-login-lock');
const AUTH_LOGIN_STATE_PATH = join(tmpdir(), 'lp-front-e2e-auth-login-state.json');
const AUTH_LOGIN_LOCK_TIMEOUT_MS = 90_000;
const AUTH_LOGIN_LOCK_RETRY_MS = 200;
const MIN_LOGIN_GAP_MS = 400;
const DEBUG_E2E_AUTH = envTest.playwright.debugArtifacts;

const logSharedAuth = (event: string, details: Record<string, unknown> = {}): void => {
  if (!DEBUG_E2E_AUTH) {
    return;
  }

  console.error(
    `[e2e] ${JSON.stringify({
      component: 'e2e-shared-auth',
      event,
      ...details,
    })}`,
  );
};

const shouldClearStaleLock = async (path: string, timeoutMs: number): Promise<boolean> => {
  try {
    const current = await stat(path);
    return Date.now() - current.mtimeMs >= timeoutMs;
  } catch {
    return false;
  }
};

export const parseRetryAfterSeconds = (response: SharedLoginResponse): number | null => {
  const retryAfterHeader = response.headers?.['retry-after'];
  if (retryAfterHeader) {
    const headerSeconds = Number(retryAfterHeader);
    if (Number.isFinite(headerSeconds) && headerSeconds > 0) {
      return headerSeconds;
    }
  }

  const payload = response.payload as { error?: { code?: string; message?: string } } | null;
  const code = payload?.error?.code;
  const message = payload?.error?.message ?? '';
  const hasRateLimitSignal =
    code === 'RATE_LIMITED' ||
    response.status === 429 ||
    /too many requests/i.test(message) ||
    /retry after \d+ seconds?/i.test(message);

  if (!hasRateLimitSignal) {
    return null;
  }

  const match = message.match(/retry after (\d+) seconds?/i);
  if (!match) {
    return null;
  }

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
};

const readSharedLoginState = async (): Promise<SharedLoginState> => {
  try {
    const raw = await readFile(AUTH_LOGIN_STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SharedLoginState>;

    return {
      lastLoginAt: typeof parsed.lastLoginAt === 'number' ? parsed.lastLoginAt : 0,
      nextAllowedAt: typeof parsed.nextAllowedAt === 'number' ? parsed.nextAllowedAt : 0,
    };
  } catch {
    return {
      lastLoginAt: 0,
      nextAllowedAt: 0,
    };
  }
};

const writeSharedLoginState = async (state: SharedLoginState): Promise<void> => {
  await writeFile(AUTH_LOGIN_STATE_PATH, JSON.stringify(state), 'utf8');
};

const acquireSharedLoginLock = async (): Promise<void> => {
  const startedAt = Date.now();

  while (true) {
    try {
      await mkdir(AUTH_LOGIN_LOCK_PATH);
      return;
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? error.code : undefined;
      if (code !== 'EEXIST') {
        throw error;
      }

      if (await shouldClearStaleLock(AUTH_LOGIN_LOCK_PATH, AUTH_LOGIN_LOCK_TIMEOUT_MS)) {
        logSharedAuth('login-lock-stale-clear');
        await releaseSharedLoginLock();
        continue;
      }

      if (Date.now() - startedAt >= AUTH_LOGIN_LOCK_TIMEOUT_MS) {
        throw new Error('Timed out waiting for the shared E2E auth login lock.');
      }

      await sleep(AUTH_LOGIN_LOCK_RETRY_MS);
    }
  }
};

const releaseSharedLoginLock = async (): Promise<void> => {
  await rm(AUTH_LOGIN_LOCK_PATH, { recursive: true, force: true });
};

export const runSharedLoginAttempt = async <T extends SharedLoginResponse>(
  attempt: () => Promise<T>,
): Promise<T> => {
  logSharedAuth('login-lock-wait-start');
  await acquireSharedLoginLock();
  try {
    const state = await readSharedLoginState();
    const now = Date.now();
    const gateUntil = Math.max(state.lastLoginAt + MIN_LOGIN_GAP_MS, state.nextAllowedAt);
    logSharedAuth('login-lock-acquired', {
      gateDelayMs: Math.max(gateUntil - now, 0),
      nextAllowedAt: state.nextAllowedAt,
    });

    if (gateUntil > now) {
      await sleep(gateUntil - now);
    }

    logSharedAuth('login-attempt-start');
    const response = await attempt();
    const completedAt = Date.now();
    const retryAfterSeconds = parseRetryAfterSeconds(response);
    logSharedAuth('login-attempt-finished', {
      retryAfterSeconds,
      status: response.status,
    });

    await writeSharedLoginState({
      lastLoginAt: completedAt,
      nextAllowedAt:
        retryAfterSeconds !== null ? completedAt + retryAfterSeconds * 1000 : state.nextAllowedAt,
    });

    return response;
  } finally {
    logSharedAuth('login-lock-release');
    await releaseSharedLoginLock();
  }
};
