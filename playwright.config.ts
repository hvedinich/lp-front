import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/shared/config/env';
import { isLocalUrl, resolveE2EBaseUrl } from './e2e/support/helpers/base-url';

const runningInCi = env.playwright.isCi;
const baseURL = resolveE2EBaseUrl();
const localWorkersDefault = 2;
const ciWorkersDefault = 4;
const localWorkers = env.playwright.workers ?? localWorkersDefault;

if (runningInCi && !process.env.PLAYWRIGHT_BASE_URL) {
  throw new Error('[config] CI mode requires PLAYWRIGHT_BASE_URL to target a deployed app.');
}

if (runningInCi && isLocalUrl(baseURL)) {
  throw new Error(
    `[config] CI mode must target deployed URL, received local baseURL: "${baseURL}".`,
  );
}

const apiUrl = env.app.apiUrl;
const webServerEnv = {
  PORT: String(env.app.port),
  NEXT_PUBLIC_API_URL: apiUrl,
} satisfies Record<string, string>;

const webServer =
  runningInCi || !isLocalUrl(baseURL)
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        timeout: 120_000,
        reuseExistingServer: true,
        env: webServerEnv,
      };

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  workers: runningInCi ? ciWorkersDefault : localWorkers,
  retries: runningInCi ? 1 : 0,
  reporter: runningInCi ? [['github'], ['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
