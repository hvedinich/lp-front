import type { Browser, WorkerInfo } from '@playwright/test';
import { expect, test as base } from '@playwright/test';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  cleanupE2EUser,
  ensureAuthenticatedE2EUser,
  getWorkerCredentials,
} from '../support/api/auth.api';
import type { SessionPayload } from '../support/contracts/backend.types';
import { apiRequest, toApiError } from '../support/api/client.api';
import { createAuthFixture, type AuthFixture } from './auth.fixture';
import { createLocationFixture, type LocationFixture } from './location.fixture';
import { envTest } from '@/shared/config/env';

interface E2EFixtures {
  auth: AuthFixture;
  locations: LocationFixture;
}

interface E2EInternalFixtures {
  failureMetadata: FailureMetadata;
}

interface E2EWorkerFixtures {
  appStorageStatePath: string;
}

interface SerializedLocationStateFixture {
  locationTestPrefix: string;
}

interface FailureMetadata {
  consoleErrors: string[];
  failedRequests: Array<{ errorText: string | null; method: string; url: string }>;
  locationSeedIds?: string[];
  onConsole?: (message: { text: () => string; type: () => string }) => void;
  onPageError?: (error: Error) => void;
  onRequestFailed?: (request: {
    failure: () => { errorText?: string } | null;
    method: () => string;
    url: () => string;
  }) => void;
  pageErrors: string[];
  testPrefix?: string;
}

interface FailureAttachmentPayload {
  consoleErrors: string[];
  failedRequests: Array<{ errorText: string | null; method: string; url: string }>;
  metadata: FailureMetadata;
  pageErrors: string[];
  testId: string;
  testTitle: string;
  url: string | null;
  workerIndex: number;
}

const DEBUG_E2E_AUTH = envTest.playwright.debugArtifacts;

const logStorageBootstrap = (event: string, details: Record<string, unknown> = {}): void => {
  if (!DEBUG_E2E_AUTH) {
    return;
  }

  console.error(
    `[e2e] ${JSON.stringify({
      component: 'e2e-storage-bootstrap',
      event,
      ...details,
    })}`,
  );
};

const logCleanupFailure = (
  target: 'auth-fixture' | 'storage-state',
  credentials: { email: string },
  error: unknown,
): void => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    `[e2e] ${JSON.stringify({
      component: 'e2e-user-cleanup',
      email: credentials.email,
      error: message,
      target,
    })}`,
  );
};

const createAppStorageStateFixture = async (
  { browser }: { browser: Browser },
  applyFixture: (value: string) => Promise<void>,
  workerInfo: WorkerInfo,
) => {
  const baseURL = envTest.playwright.baseUrl;
  const authDir = join(process.cwd(), 'e2e', 'storage');
  await mkdir(authDir, { recursive: true });
  const authScope = `app-worker-${workerInfo.workerIndex}`;
  const statePath = join(authDir, `app-worker-${workerInfo.workerIndex}.json`);
  const credentials = getWorkerCredentials(workerInfo.workerIndex, authScope);
  let shouldCleanupUser = false;

  try {
    logStorageBootstrap('setup-start', { authScope, statePath, target: 'app' });
    const hasExistingState = await access(statePath)
      .then(() => true)
      .catch(() => false);
    logStorageBootstrap('cached-state-check-finished', {
      authScope,
      hasExistingState,
      target: 'app',
    });

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
      logStorageBootstrap('ensure-auth-start', { authScope, target: 'app' });
      await ensureAuthenticatedE2EUser(context.request, workerInfo.workerIndex, authScope);
      logStorageBootstrap('ensure-auth-finished', { authScope, target: 'app' });
      shouldCleanupUser = true;
      logStorageBootstrap('session-verify-start', { authScope, target: 'app' });
      const sessionResponse = await apiRequest<SessionPayload>(context.request, {
        method: 'GET',
        path: '/auth/me',
      });
      logStorageBootstrap('session-verify-finished', {
        authScope,
        status: sessionResponse.status,
        target: 'app',
      });
      const role = sessionResponse.payload?.account?.role;
      if (!sessionResponse.ok || (role !== 'owner' && role !== 'admin')) {
        throw new Error(
          `Unable to verify authenticated manage session before storageState. ${toApiError(sessionResponse)}`,
        );
      }
      await context.storageState({ path: statePath });
      logStorageBootstrap('storage-state-written', { authScope, target: 'app' });
    } finally {
      await context.close();
    }

    await applyFixture(statePath);
  } finally {
    try {
      if (shouldCleanupUser) {
        logStorageBootstrap('cleanup-start', { authScope, target: 'app' });
        const cleanupContext = await browser.newContext({
          baseURL,
          storageState: statePath,
        });

        try {
          try {
            await cleanupE2EUser(cleanupContext.request, credentials);
          } catch (error) {
            logCleanupFailure('storage-state', credentials, error);
          }
        } finally {
          await cleanupContext.close();
        }
        logStorageBootstrap('cleanup-finished', { authScope, target: 'app' });
      }
    } finally {
      await rm(statePath, { force: true });
      logStorageBootstrap('setup-finished', { authScope, target: 'app' });
    }
  }
};

export const test = base.extend<E2EFixtures & E2EInternalFixtures, E2EWorkerFixtures>({
  failureMetadata: async ({}, applyFixture) => {
    await applyFixture({
      consoleErrors: [],
      failedRequests: [],
      pageErrors: [],
    });
  },
  appStorageStatePath: [createAppStorageStateFixture, { scope: 'worker' }],
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
        try {
          await authFixture.cleanupUser(credentials);
        } catch (error) {
          logCleanupFailure('auth-fixture', credentials, error);
        }
      }
    }
  },
  locations: async ({ failureMetadata, page }, applyFixture) => {
    await applyFixture(createLocationFixture(page.request, failureMetadata));
  },
});

test.beforeEach(async ({ failureMetadata, page }) => {
  failureMetadata.onConsole = (message) => {
    if (message.type() === 'error') {
      failureMetadata.consoleErrors.push(message.text());
    }
  };
  failureMetadata.onPageError = (error) => {
    failureMetadata.pageErrors.push(error.message);
  };
  failureMetadata.onRequestFailed = (request) => {
    failureMetadata.failedRequests.push({
      errorText: request.failure()?.errorText ?? null,
      method: request.method(),
      url: request.url(),
    });
  };

  page.on('console', failureMetadata.onConsole);
  page.on('pageerror', failureMetadata.onPageError);
  page.on('requestfailed', failureMetadata.onRequestFailed);
});

test.afterEach(async ({ failureMetadata, page }, testInfo) => {
  if (failureMetadata.onConsole) {
    page.off('console', failureMetadata.onConsole);
  }
  if (failureMetadata.onPageError) {
    page.off('pageerror', failureMetadata.onPageError);
  }
  if (failureMetadata.onRequestFailed) {
    page.off('requestfailed', failureMetadata.onRequestFailed);
  }

  if (testInfo.status === testInfo.expectedStatus) {
    return;
  }

  const payload: FailureAttachmentPayload = {
    consoleErrors: failureMetadata.consoleErrors.slice(-10),
    failedRequests: failureMetadata.failedRequests.slice(-10),
    metadata: failureMetadata,
    pageErrors: failureMetadata.pageErrors.slice(-10),
    testId: testInfo.testId,
    testTitle: testInfo.title,
    url: page.isClosed() ? null : page.url(),
    workerIndex: testInfo.workerIndex,
  };

  const failureContextBody = JSON.stringify(payload, null, 2);
  const failureContextPath = testInfo.outputPath('failure-context.json');
  await writeFile(failureContextPath, failureContextBody);

  await testInfo.attach('failure-context', {
    body: Buffer.from(failureContextBody),
    contentType: 'application/json',
  });
});

export const locationsTest = test.extend<SerializedLocationStateFixture>({
  locationTestPrefix: async ({ locations }, applyFixture, testInfo) => {
    const prefix = await locations.cleanupForTest(testInfo.testId);

    try {
      await applyFixture(prefix);
    } finally {
      await locations.cleanupAfterTest(testInfo, prefix);
    }
  },
  storageState: async ({ appStorageStatePath }, applyFixture) => {
    await applyFixture(appStorageStatePath);
  },
});

export const devicesTest = test.extend<SerializedLocationStateFixture>({
  locationTestPrefix: async ({ locations }, applyFixture, testInfo) => {
    const prefix = await locations.cleanupForTest(testInfo.testId);

    try {
      await applyFixture(prefix);
    } finally {
      await locations.cleanupAfterTest(testInfo, prefix);
    }
  },
  storageState: async ({ appStorageStatePath }, applyFixture) => {
    await applyFixture(appStorageStatePath);
  },
});

export { expect };
