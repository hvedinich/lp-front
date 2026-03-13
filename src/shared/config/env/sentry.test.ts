import { afterEach, describe, expect, it, vi } from 'vitest';

describe('envBrowserSentry', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_ENABLED;
    delete process.env.NEXT_PUBLIC_SENTRY_ENV;
    delete process.env.NEXT_PUBLIC_SENTRY_RELEASE;
    delete process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;
    delete process.env.SENTRY_RELEASE_SHA;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.GIT_COMMIT_SHA;
    delete process.env.SENTRY_DSN;
    vi.resetModules();
  });

  it('reads browser env from explicit NEXT_PUBLIC process env access by default', async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://public@example.ingest.sentry.io/1';
    process.env.NEXT_PUBLIC_SENTRY_ENABLED = 'true';
    process.env.NEXT_PUBLIC_SENTRY_ENV = 'staging';

    const { envBrowserSentry } = await import('./sentry');

    expect(envBrowserSentry).toEqual(
      expect.objectContaining({
        NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
        NEXT_PUBLIC_SENTRY_ENABLED: 'true',
        NEXT_PUBLIC_SENTRY_ENV: 'staging',
      }),
    );
  });
});

describe('envServerSentry', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SENTRY_ENABLED;
    delete process.env.NEXT_PUBLIC_SENTRY_ENV;
    delete process.env.SENTRY_DSN;
    vi.resetModules();
  });

  it('reads server-only variables from the runtime env object', async () => {
    process.env.NEXT_PUBLIC_SENTRY_ENABLED = 'true';
    process.env.NEXT_PUBLIC_SENTRY_ENV = 'production';
    process.env.SENTRY_DSN = 'https://server@example.ingest.sentry.io/1';

    const { envServerSentry } = await import('./sentry');

    expect(envServerSentry).toEqual(
      expect.objectContaining({
        NEXT_PUBLIC_SENTRY_ENABLED: 'true',
        NEXT_PUBLIC_SENTRY_ENV: 'production',
        SENTRY_DSN: 'https://server@example.ingest.sentry.io/1',
      }),
    );
  });
});
