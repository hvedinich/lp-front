import type { SentryBuildOptions } from '@sentry/nextjs';
import { getBuildEnv } from '../../src/shared/config/env/build';
import { normalizeOptionalString, parseBooleanFlag } from '../../src/shared/config/env/core';
import {
  buildSentryRelease,
  resolveSentryReleaseSha,
  resolveSentryRuntimeMode,
} from '../../src/shared/config/sentry';
import type { BuildEnv } from '../../src/shared/config/env/build';

const isCi = (value: string | undefined): boolean => parseBooleanFlag(value);

export const getSentryBuildReleaseName = (source?: Record<string, unknown>): string | undefined => {
  const env = getBuildEnv(source) as BuildEnv;
  const runtimeMode = resolveSentryRuntimeMode({
    enabled: env.NEXT_PUBLIC_SENTRY_ENABLED,
    environment: env.NEXT_PUBLIC_SENTRY_ENV,
  });

  if (!runtimeMode.enabled) {
    return undefined;
  }

  const gitSha = resolveSentryReleaseSha(env);

  if (!gitSha) {
    throw new Error(
      '[config] Missing required Sentry build variables: SENTRY_RELEASE_SHA or VERCEL_GIT_COMMIT_SHA or GIT_COMMIT_SHA.',
    );
  }

  return buildSentryRelease({
    environment: runtimeMode.environment,
    gitSha,
  });
};

export const getSentryBuildOptions = (source?: Record<string, unknown>): SentryBuildOptions => {
  const env = getBuildEnv(source) as BuildEnv;
  const runtimeMode = resolveSentryRuntimeMode({
    enabled: env.NEXT_PUBLIC_SENTRY_ENABLED,
    environment: env.NEXT_PUBLIC_SENTRY_ENV,
  });

  if (!runtimeMode.enabled) {
    // Keep preview/local builds free from Sentry release and sourcemap side effects.
    return {
      release: {
        create: false,
        finalize: false,
      },
      silent: !isCi(env.CI),
      sourcemaps: {
        disable: true,
      },
    };
  }

  const authToken = normalizeOptionalString(env.SENTRY_AUTH_TOKEN);
  const org = normalizeOptionalString(env.SENTRY_ORG);
  const project = normalizeOptionalString(env.SENTRY_PROJECT);
  const gitSha = resolveSentryReleaseSha(env);
  const releaseName = gitSha
    ? buildSentryRelease({
        environment: runtimeMode.environment,
        gitSha,
      })
    : undefined;

  // Build-time release must match runtime release so uploaded artifacts and events cannot drift.
  const missingKeys = [
    ['SENTRY_AUTH_TOKEN', authToken],
    ['SENTRY_ORG', org],
    ['SENTRY_PROJECT', project],
    ['SENTRY_RELEASE_SHA or VERCEL_GIT_COMMIT_SHA or GIT_COMMIT_SHA', releaseName],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`[config] Missing required Sentry build variables: ${missingKeys.join(', ')}.`);
  }

  return {
    authToken,
    org,
    project,
    release: {
      name: releaseName!,
    },
    silent: !isCi(env.CI),
  };
};
