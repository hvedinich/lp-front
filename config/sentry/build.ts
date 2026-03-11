import type { SentryBuildOptions } from '@sentry/nextjs';
import { resolveBuildEnv } from '../../src/shared/config/env/build';
import { normalizeOptionalString } from '../../src/shared/config/env/shared';
import {
  buildSentryRelease,
  resolveSentryReleaseSha,
  resolveSentryRuntimeMode,
} from '../../src/shared/config/sentry';
import type { BuildEnv } from '../../src/shared/config/env/build';

const isCi = (value: string | undefined): boolean => {
  const normalized = normalizeOptionalString(value)?.toLowerCase();

  if (!normalized) {
    return false;
  }

  return normalized !== '0' && normalized !== 'false';
};

export const getSentryBuildOptions = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): SentryBuildOptions => {
  const env = resolveBuildEnv(source) as BuildEnv;
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

  // Build-time release must match runtime release so uploaded artifacts and events cannot drift.
  const missingKeys = [
    ['SENTRY_AUTH_TOKEN', authToken],
    ['SENTRY_ORG', org],
    ['SENTRY_PROJECT', project],
    ['SENTRY_RELEASE_SHA or VERCEL_GIT_COMMIT_SHA or GIT_COMMIT_SHA', gitSha],
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
      name: buildSentryRelease({
        environment: runtimeMode.environment,
        gitSha: gitSha!,
      }),
    },
    silent: !isCi(env.CI),
  };
};
