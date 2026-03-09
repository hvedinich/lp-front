import type { Browser, TestInfo } from '@playwright/test';
import { expect, test as base } from '@playwright/test';
import { access, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  cleanupE2EUser,
  ensureAuthenticatedE2EUser,
  getWorkerCredentials,
} from '../support/api/auth.api';
import type { SessionPayload } from '../support/contracts/backend.types';
import { apiRequest, toApiError } from '../support/api/client.api';
import { resolveE2EBaseUrl } from '../support/helpers/base-url';
import { toTestPrefix } from '../support/helpers/routes';
import { createAuthFixture, type AuthFixture } from './auth.fixture';
import { createLocationFixture, type LocationFixture } from './location.fixture';
import { env } from '@/shared/config';

interface E2EFixtures {
  auth: AuthFixture;
  devicesStorageStatePath: string;
  locations: LocationFixture;
  locationsStorageStatePath: string;
}

interface E2EInternalFixtures {
  locationStateLock: void;
}

interface SerializedLocationStateFixture {
  serializedLocationState: void;
}

const LOCATION_STATE_LOCK_PATH = join(tmpdir(), 'lp-front-e2e-location-state-lock');
const LOCATION_STATE_LOCK_TIMEOUT_MS = 60_000;
const LOCATION_STATE_LOCK_RETRY_MS = 200;

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const acquireLocationStateLock = async (): Promise<void> => {
  const startedAt = Date.now();

  while (true) {
    try {
      await mkdir(LOCATION_STATE_LOCK_PATH);
      return;
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? error.code : undefined;
      if (code !== 'EEXIST') {
        throw error;
      }

      if (Date.now() - startedAt >= LOCATION_STATE_LOCK_TIMEOUT_MS) {
        throw new Error('Timed out waiting for the shared E2E location-state lock.');
      }

      await sleep(LOCATION_STATE_LOCK_RETRY_MS);
    }
  }
};

const releaseLocationStateLock = async (): Promise<void> => {
  await rm(LOCATION_STATE_LOCK_PATH, { recursive: true, force: true });
};

const createScopedStorageStateFixture = (target: 'devices' | 'locations') => {
  return async (
    { browser }: { browser: Browser },
    applyFixture: (value: string) => Promise<void>,
    testInfo: TestInfo,
  ) => {
    const baseURL = target === 'devices' ? env.app.url : resolveE2EBaseUrl();
    const authDir = join(process.cwd(), 'e2e', 'storage');
    await mkdir(authDir, { recursive: true });
    const statePath = join(authDir, `${target}-${toTestPrefix(testInfo.testId)}.json`);
    const credentials = getWorkerCredentials(testInfo.workerIndex, testInfo.testId);
    let shouldCleanupUser = false;

    try {
      const hasExistingState = await access(statePath)
        .then(() => true)
        .catch(() => false);

      if (hasExistingState) {
        const cachedContext = await browser.newContext({
          baseURL,
          storageState: statePath,
        });
        try {
          const cachedSession = await apiRequest<SessionPayload>(cachedContext.request, {
            method: 'GET',
            path: '/auth/me',
          });
          const cachedRole = cachedSession.payload?.account?.role;
          if (cachedSession.ok && (cachedRole === 'owner' || cachedRole === 'admin')) {
            shouldCleanupUser = true;
            await applyFixture(statePath);
            return;
          }
        } finally {
          await cachedContext.close();
        }
      }

      const context = await browser.newContext({ baseURL });

      try {
        await ensureAuthenticatedE2EUser(context.request, testInfo.workerIndex, testInfo.testId);
        shouldCleanupUser = true;
        const sessionResponse = await apiRequest<SessionPayload>(context.request, {
          method: 'GET',
          path: '/auth/me',
        });
        const role = sessionResponse.payload?.account?.role;
        if (!sessionResponse.ok || (role !== 'owner' && role !== 'admin')) {
          throw new Error(
            `Unable to verify authenticated manage session before storageState. ${toApiError(sessionResponse)}`,
          );
        }
        await context.storageState({ path: statePath });
      } finally {
        await context.close();
      }

      await applyFixture(statePath);
    } finally {
      try {
        if (shouldCleanupUser) {
          const cleanupContext = await browser.newContext({ baseURL });

          try {
            await cleanupE2EUser(cleanupContext.request, credentials);
          } finally {
            await cleanupContext.close();
          }
        }
      } finally {
        await rm(statePath, { force: true });
      }
    }
  };
};

export const test = base.extend<E2EFixtures & E2EInternalFixtures>({
  devicesStorageStatePath: createScopedStorageStateFixture('devices'),
  locationsStorageStatePath: createScopedStorageStateFixture('locations'),
  locationStateLock: async ({}, applyFixture) => {
    await acquireLocationStateLock();

    try {
      await applyFixture();
    } finally {
      await releaseLocationStateLock();
    }
  },
  auth: async ({ page, request }, applyFixture) => {
    const trackedCredentials = new Map<string, { email: string; password: string }>();
    const authFixture = createAuthFixture(page, request);

    try {
      await applyFixture({
        ...authFixture,
        ensureUser: async (workerIndex, scope = '') => {
          const credentials = await authFixture.ensureUser(workerIndex, scope);
          trackedCredentials.set(credentials.email, credentials);
          return credentials;
        },
      });
    } finally {
      for (const credentials of trackedCredentials.values()) {
        await authFixture.cleanupUser(credentials);
      }
    }
  },
  locations: async ({ page }, applyFixture) => {
    await applyFixture(createLocationFixture(page.request));
  },
});

export const locationsTest = test.extend<SerializedLocationStateFixture>({
  serializedLocationState: [
    async (
      { locationStateLock }: { locationStateLock: void },
      applyFixture: () => Promise<void>,
    ) => {
      void locationStateLock;
      await applyFixture();
    },
    { auto: true },
  ],
  storageState: async ({ locationsStorageStatePath }, applyFixture) => {
    await applyFixture(locationsStorageStatePath);
  },
});

export const devicesTest = test.extend<SerializedLocationStateFixture>({
  serializedLocationState: [
    async (
      { locationStateLock }: { locationStateLock: void },
      applyFixture: () => Promise<void>,
    ) => {
      void locationStateLock;
      await applyFixture();
    },
    { auto: true },
  ],
  storageState: async ({ devicesStorageStatePath }, applyFixture) => {
    await applyFixture(devicesStorageStatePath);
  },
});

export { expect };
