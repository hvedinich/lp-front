import { afterEach, describe, expect, it, vi } from 'vitest';

describe('envTestRuntime', () => {
  afterEach(() => {
    delete process.env.PLAYWRIGHT_BASE_URL;
    delete process.env.PLAYWRIGHT_DEBUG_ARTIFACTS;
    delete process.env.PLAYWRIGHT_E2E_EMAIL;
    delete process.env.PLAYWRIGHT_E2E_LANE;
    delete process.env.PLAYWRIGHT_E2E_PASSWORD;
    delete process.env.PLAYWRIGHT_E2E_SCOPE;
    delete process.env.PLAYWRIGHT_LOCATION_PREFIX;
    delete process.env.PLAYWRIGHT_WORKERS;
    vi.resetModules();
  });

  it('applies defaults for optional Playwright env values', async () => {
    const { envTestRuntime } = await import('./test');

    expect(envTestRuntime).toEqual({
      PLAYWRIGHT_BASE_URL: undefined,
      PLAYWRIGHT_DEBUG_ARTIFACTS: undefined,
      PLAYWRIGHT_E2E_EMAIL: 'playwright-e2e@localprof.dev',
      PLAYWRIGHT_E2E_LANE: 'all',
      PLAYWRIGHT_E2E_PASSWORD: 'PlaywrightE2E123!',
      PLAYWRIGHT_E2E_SCOPE: undefined,
      PLAYWRIGHT_LOCATION_PREFIX: 'PW-E2E',
      PLAYWRIGHT_WORKERS: undefined,
      PLAYWRIGHT_ONBOARDING_DEVICE_IDS: 'id',
      PLAYWRIGHT_ONBOARDING_DEVICE_SHORT_CODES: 'onbording-test',
    });
  });

  it('validates supported lane values', async () => {
    process.env.PLAYWRIGHT_E2E_LANE = 'invalid';

    await expect(import('./test')).rejects.toThrowError(
      '[config] Invalid test environment variables',
    );
  });
});
