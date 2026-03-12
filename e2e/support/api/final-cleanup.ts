import 'dotenv/config';
import { request } from '@playwright/test';
import { cleanupE2EUser } from './auth.api';
import { listTrackedE2EUsers } from './auth-registry';
import { envTest } from '@/shared/config/env';

export const runFinalE2ECleanup = async (): Promise<void> => {
  const entries = await listTrackedE2EUsers();
  if (entries.length === 0) {
    return;
  }

  for (const credentials of entries) {
    const api = await request.newContext({
      baseURL: envTest.playwright.baseUrl,
    });

    try {
      await cleanupE2EUser(api, credentials);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[e2e] ${JSON.stringify({
          component: 'e2e-final-cleanup',
          email: credentials.email,
          error: message,
        })}`,
      );
    } finally {
      await api.dispose();
    }
  }
};
