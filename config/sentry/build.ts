import type { SentryBuildOptions } from '@sentry/nextjs';
import {
  buildSentryRelease,
  resolveSentryReleaseSha,
  resolveSentryRuntimeMode,
} from '../../src/shared/config/sentry';

type SentryBuildEnv = Partial<
  Record<
    | 'CI'
    | 'GIT_COMMIT_SHA'
    | 'NEXT_PUBLIC_SENTRY_ENABLED'
    | 'NEXT_PUBLIC_SENTRY_ENV'
    | 'SENTRY_AUTH_TOKEN'
    | 'SENTRY_ORG'
    | 'SENTRY_PROJECT'
    | 'SENTRY_RELEASE_SHA'
    | 'VERCEL_GIT_COMMIT_SHA',
    string | undefined
  >
>;

const normalizeEnvString = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
};

const isCi = (value: string | undefined): boolean => {
  const normalized = normalizeEnvString(value)?.toLowerCase();

  if (!normalized) {
    return false;
  }

  return normalized !== '0' && normalized !== 'false';
};

export const getSentryBuildOptions = (
  env: SentryBuildEnv = process.env as SentryBuildEnv,
): SentryBuildOptions => {
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

  const authToken = normalizeEnvString(env.SENTRY_AUTH_TOKEN);
  const org = normalizeEnvString(env.SENTRY_ORG);
  const project = normalizeEnvString(env.SENTRY_PROJECT);
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
