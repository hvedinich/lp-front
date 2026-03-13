import { resolveSentryReleaseSha } from '@/shared/config/sentry';
import { getSentryBuildOptions, getSentryBuildReleaseName } from './build';

describe('resolveSentryReleaseSha', () => {
  it('prefers SENTRY_RELEASE_SHA over Vercel and generic git sha', () => {
    expect(
      resolveSentryReleaseSha({
        GIT_COMMIT_SHA: 'generic',
        SENTRY_RELEASE_SHA: 'explicit',
        VERCEL_GIT_COMMIT_SHA: 'vercel',
      }),
    ).toBe('explicit');
  });

  it('falls back to VERCEL_GIT_COMMIT_SHA and then GIT_COMMIT_SHA', () => {
    expect(
      resolveSentryReleaseSha({ GIT_COMMIT_SHA: 'generic', VERCEL_GIT_COMMIT_SHA: 'vercel' }),
    ).toBe('vercel');
    expect(resolveSentryReleaseSha({ GIT_COMMIT_SHA: 'generic' })).toBe('generic');
  });
});

describe('getSentryBuildOptions', () => {
  it('disables sourcemap upload when Sentry is disabled', () => {
    expect(
      getSentryBuildOptions({
        CI: 'true',
        NEXT_PUBLIC_SENTRY_ENABLED: 'false',
      }),
    ).toEqual({
      release: {
        create: false,
        finalize: false,
      },
      silent: false,
      sourcemaps: {
        disable: true,
      },
    });
  });

  it('builds enabled options for staging', () => {
    expect(
      getSentryBuildOptions({
        CI: 'true',
        GIT_COMMIT_SHA: 'abc123',
        NEXT_PUBLIC_SENTRY_ENABLED: 'true',
        NEXT_PUBLIC_SENTRY_ENV: 'staging',
        SENTRY_AUTH_TOKEN: 'token',
        SENTRY_ORG: 'org',
        SENTRY_PROJECT: 'project',
      }),
    ).toEqual({
      authToken: 'token',
      org: 'org',
      project: 'project',
      release: {
        name: 'lp@staging-abc123',
      },
      silent: false,
    });
  });

  it('throws when enabled mode is missing build secrets', () => {
    try {
      getSentryBuildOptions({
        NEXT_PUBLIC_SENTRY_ENABLED: 'true',
        NEXT_PUBLIC_SENTRY_ENV: 'production',
      });
    } catch (error) {
      expect((error as Error).message).toBe(
        '[config] Missing required Sentry build variables: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_RELEASE_SHA or VERCEL_GIT_COMMIT_SHA or GIT_COMMIT_SHA.',
      );
      return;
    }

    throw new Error('Expected getSentryBuildOptions to throw when build secrets are missing.');
  });
});

describe('getSentryBuildReleaseName', () => {
  it('returns the public release name for enabled staging builds', () => {
    expect(
      getSentryBuildReleaseName({
        GIT_COMMIT_SHA: 'abc123',
        NEXT_PUBLIC_SENTRY_ENABLED: 'true',
        NEXT_PUBLIC_SENTRY_ENV: 'staging',
      }),
    ).toBe('lp@staging-abc123');
  });

  it('returns undefined when Sentry is disabled', () => {
    expect(
      getSentryBuildReleaseName({
        NEXT_PUBLIC_SENTRY_ENABLED: 'false',
      }),
    ).toBe(undefined);
  });
});
