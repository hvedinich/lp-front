import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { testEnv } from './e2e/support/config/env';
import { isLocalUrl, resolveE2EBaseUrl } from './e2e/support/helpers/base-url';

const runningInCi = testEnv.playwright.isCi;
const debugArtifactsEnabled = testEnv.playwright.debugArtifacts;
const e2eLane = process.env.PLAYWRIGHT_E2E_LANE ?? 'all';
const baseURL = resolveE2EBaseUrl();
const localWorkersDefault = 2;
const ciWorkersDefault = 4;
const localWorkers = testEnv.playwright.workers ?? localWorkersDefault;
const authSpecPattern = /.*\/auth\/.*\.spec\.ts/;
const workerCount = e2eLane === 'auth' ? 1 : runningInCi ? ciWorkersDefault : localWorkers;
const outputDir =
  e2eLane === 'auth'
    ? 'test-results/auth'
    : e2eLane === 'app'
      ? 'test-results/app'
      : 'test-results';
const htmlReportFolder =
  e2eLane === 'auth'
    ? 'playwright-report/auth'
    : e2eLane === 'app'
      ? 'playwright-report/app'
      : 'playwright-report';

if (runningInCi && !process.env.PLAYWRIGHT_BASE_URL) {
  throw new Error('[config] CI mode requires PLAYWRIGHT_BASE_URL to target a deployed app.');
}

if (runningInCi && isLocalUrl(baseURL)) {
  throw new Error(
    `[config] CI mode must target deployed URL, received local baseURL: "${baseURL}".`,
  );
}

const apiUrl = testEnv.app.apiUrl;
const webServerEnv = {
  PORT: String(testEnv.app.port),
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
  forbidOnly: runningInCi,
  globalSetup: './playwright.global-setup.ts',
  globalTeardown: './playwright.global-teardown.ts',
  outputDir,
  testIgnore: e2eLane === 'app' ? authSpecPattern : undefined,
  testMatch: e2eLane === 'auth' ? authSpecPattern : undefined,
  workers: workerCount,
  retries: runningInCi ? 1 : 0,
  reporter:
    runningInCi || debugArtifactsEnabled
      ? [
          ['list'],
          ['html', { open: 'never', outputFolder: htmlReportFolder }],
          ...(runningInCi ? ([['github']] as const) : []),
        ]
      : 'list',
  use: {
    baseURL,
    screenshot: debugArtifactsEnabled ? 'only-on-failure' : 'off',
    trace: debugArtifactsEnabled ? 'retain-on-failure' : 'on-first-retry',
    video: debugArtifactsEnabled ? 'retain-on-failure' : 'off',
  },
  webServer,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
