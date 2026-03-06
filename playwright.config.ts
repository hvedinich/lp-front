import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/shared/config/env';

const isLocalUrl = (value: string): boolean => {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

const baseURL = env.app.url;
const runningInCi = env.playwright.isCi;
const localWorkersDefault = 2;
const ciWorkersDefault = 4;
const localWorkers = env.playwright.workers ?? localWorkersDefault;

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
  reporter: runningInCi ? [['html', { open: 'never' }], ['list']] : 'list',
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
