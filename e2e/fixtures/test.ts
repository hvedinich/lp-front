import { expect, test as base } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { env } from '../../src/shared/config/env';
import { ensureE2EUser, loginViaApi } from '../support/api/auth.api';
import { ensureOk } from '../support/api/client.api';
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
      const authDir = await mkdtemp(join(tmpdir(), 'lp-e2e-auth-'));
      const statePath = join(authDir, `locations-worker-${workerInfo.workerIndex}.json`);
      const context = await browser.newContext({ baseURL: env.app.url });

      try {
        const credentials = await ensureE2EUser(
          context.request,
          workerInfo.workerIndex,
          'locations',
        );
        const loginResponse = await loginViaApi(context.request, credentials);
        ensureOk(loginResponse, 'Unable to create worker storage state for locations tests');
        await context.storageState({ path: statePath });
      } finally {
        await context.close();
      }

      try {
        await applyFixture(statePath);
      } finally {
        await rm(authDir, { recursive: true, force: true });
      }
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
