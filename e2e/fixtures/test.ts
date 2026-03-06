import { expect, test as base } from '@playwright/test';
import { access, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { env } from '../../src/shared/config/env';
import { ensureAuthenticatedE2EUser } from '../support/api/auth.api';
import type { SessionPayload } from '../support/contracts/backend.types';
import { apiRequest, toApiError } from '../support/api/client.api';
import { createAuthFixture, type AuthFixture } from './auth.fixture';
import { createLocationFixture, type LocationFixture } from './location.fixture';

interface E2EFixtures {
  auth: AuthFixture;
  locations: LocationFixture;
}

interface E2EWorkerFixtures {
  locationsStorageStatePath: string;
}

export const test = base.extend<E2EFixtures, E2EWorkerFixtures>({
  locationsStorageStatePath: [
    async ({ browser }, applyFixture, workerInfo) => {
      const authDir = join(process.cwd(), 'e2e', 'storage');
      await mkdir(authDir, { recursive: true });
      const statePath = join(authDir, `locations-worker-${workerInfo.workerIndex}.json`);

      const hasExistingState = await access(statePath)
        .then(() => true)
        .catch(() => false);

      if (hasExistingState) {
        const cachedContext = await browser.newContext({
          baseURL: env.app.url,
          storageState: statePath,
        });
        try {
          const cachedSession = await apiRequest<SessionPayload>(cachedContext.request, {
            method: 'GET',
            path: '/auth/me',
          });
          const cachedRole = cachedSession.payload?.account?.role;
          if (cachedSession.ok && (cachedRole === 'owner' || cachedRole === 'admin')) {
            await applyFixture(statePath);
            return;
          }
        } finally {
          await cachedContext.close();
        }
      }

      const context = await browser.newContext({ baseURL: env.app.url });

      try {
        await ensureAuthenticatedE2EUser(context.request, workerInfo.workerIndex, 'locations');
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
    },
    { scope: 'worker' },
  ],
  auth: async ({ page, request }, applyFixture) => {
    await applyFixture(createAuthFixture(page, request));
  },
  locations: async ({ page }, applyFixture) => {
    await applyFixture(createLocationFixture(page.request));
  },
});

export const locationsTest = test.extend({
  storageState: async ({ locationsStorageStatePath }, applyFixture) => {
    await applyFixture(locationsStorageStatePath);
  },
});

export { expect };
