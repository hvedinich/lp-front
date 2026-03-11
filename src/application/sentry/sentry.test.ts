import {
  buildSentryRelease,
  resolveSentryReleaseSha,
  resolveSentryRuntimeMode,
} from '../../shared/config/sentry';
import { getBrowserSentryRuntimeOptions, getServerSentryRuntimeOptions } from '.';

describe('resolveSentryRuntimeMode', () => {
  it('returns disabled mode when the flag is absent', () => {
    expect(resolveSentryRuntimeMode({ enabled: undefined, environment: undefined })).toEqual({
      enabled: false,
    });
  });

  it('returns disabled mode when the flag is explicitly false', () => {
    expect(resolveSentryRuntimeMode({ enabled: 'false', environment: 'staging' })).toEqual({
      enabled: false,
    });
  });

  it('returns enabled staging mode', () => {
    expect(resolveSentryRuntimeMode({ enabled: 'true', environment: 'staging' })).toEqual({
      enabled: true,
      environment: 'staging',
    });
  });

  it('throws when enabled Sentry has an invalid environment', () => {
    try {
      resolveSentryRuntimeMode({ enabled: 'true', environment: 'preview' });
    } catch (error) {
      expect((error as Error).message).toBe(
        '[config] NEXT_PUBLIC_SENTRY_ENV must be either "staging" or "production" when Sentry is enabled.',
      );
      return;
    }

    throw new Error('Expected resolveSentryRuntimeMode to throw for an invalid environment.');
  });
});

describe('buildSentryRelease', () => {
  it('builds a release name with the default app name', () => {
    expect(buildSentryRelease({ environment: 'production', gitSha: 'abc123' })).toBe(
      'lp@abc123-production',
    );
  });

  it('throws when git sha is missing', () => {
    try {
      buildSentryRelease({ environment: 'staging', gitSha: '   ' });
    } catch (error) {
      expect((error as Error).message).toBe(
        '[config] A git SHA is required to build the Sentry release name.',
      );
      return;
    }

    throw new Error('Expected buildSentryRelease to throw when git SHA is missing.');
  });
});

describe('resolveSentryReleaseSha', () => {
  it('prefers explicit release sha and falls back to Vercel and generic git sha', () => {
    expect(
      resolveSentryReleaseSha({
        GIT_COMMIT_SHA: 'generic',
        SENTRY_RELEASE_SHA: 'explicit',
        VERCEL_GIT_COMMIT_SHA: 'vercel',
      }),
    ).toBe('explicit');

    expect(
      resolveSentryReleaseSha({ GIT_COMMIT_SHA: 'generic', VERCEL_GIT_COMMIT_SHA: 'vercel' }),
    ).toBe('vercel');
  });
});

describe('getBrowserSentryRuntimeOptions', () => {
  it('returns null when Sentry is disabled', () => {
    expect(getBrowserSentryRuntimeOptions({ NEXT_PUBLIC_SENTRY_ENABLED: 'false' })).toBe(null);
  });

  it('returns runtime options for enabled staging mode', () => {
    expect(
      getBrowserSentryRuntimeOptions({
        GIT_COMMIT_SHA: 'abc123',
        NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
        NEXT_PUBLIC_SENTRY_ENABLED: 'true',
        NEXT_PUBLIC_SENTRY_ENV: 'staging',
      }),
    ).toEqual(
      expect.objectContaining({
        denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i],
        dsn: 'https://public@example.ingest.sentry.io/1',
        environment: 'staging',
        ignoreErrors: ['AbortError', 'The operation was aborted.'],
        release: 'lp@abc123-staging',
        tracesSampleRate: 0.1,
      }),
    );
  });
});

describe('getServerSentryRuntimeOptions', () => {
  it('throws when Sentry is enabled without a server DSN', () => {
    try {
      getServerSentryRuntimeOptions({
        GIT_COMMIT_SHA: 'abc123',
        NEXT_PUBLIC_SENTRY_ENABLED: 'true',
        NEXT_PUBLIC_SENTRY_ENV: 'production',
      });
    } catch (error) {
      expect((error as Error).message).toBe(
        '[config] A Sentry DSN is required when Sentry is enabled.',
      );
      return;
    }

    throw new Error('Expected getServerSentryRuntimeOptions to throw when server DSN is missing.');
  });
});
