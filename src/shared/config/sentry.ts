import { normalizeOptionalString, parseBooleanFlag } from './env/core';

export type SentryEnvironment = 'staging' | 'production';

export type SentryRuntimeMode =
  | {
      enabled: false;
    }
  | {
      enabled: true;
      environment: SentryEnvironment;
    };

type ResolveSentryRuntimeModeInput = {
  enabled: string | undefined;
  environment: string | undefined;
};

type BuildSentryReleaseInput = {
  appName?: string;
  environment: SentryEnvironment;
  gitSha: string;
};

export type SentryReleaseEnv = Partial<
  Record<'GIT_COMMIT_SHA' | 'SENTRY_RELEASE_SHA' | 'VERCEL_GIT_COMMIT_SHA', string | undefined>
>;

export const resolveSentryRuntimeMode = ({
  enabled,
  environment,
}: ResolveSentryRuntimeModeInput): SentryRuntimeMode => {
  if (!parseBooleanFlag(enabled)) {
    return { enabled: false };
  }

  const normalizedEnvironment = normalizeOptionalString(environment);

  if (normalizedEnvironment !== 'staging' && normalizedEnvironment !== 'production') {
    throw new Error(
      '[config] NEXT_PUBLIC_SENTRY_ENV must be either "staging" or "production" when Sentry is enabled.',
    );
  }

  return {
    enabled: true,
    environment: normalizedEnvironment,
  };
};

export const buildSentryRelease = ({
  appName = 'lp',
  environment,
  gitSha,
}: BuildSentryReleaseInput): string => {
  const normalizedGitSha = normalizeOptionalString(gitSha);

  if (!normalizedGitSha) {
    throw new Error('[config] A git SHA is required to build the Sentry release name.');
  }

  return `${appName}@${environment}-${normalizedGitSha}`;
};

export const resolveSentryReleaseSha = (env: SentryReleaseEnv): string | undefined => {
  return (
    normalizeOptionalString(env.SENTRY_RELEASE_SHA) ??
    normalizeOptionalString(env.VERCEL_GIT_COMMIT_SHA) ??
    normalizeOptionalString(env.GIT_COMMIT_SHA)
  );
};
