import {
  buildSentryRelease,
  resolveSentryReleaseSha,
  resolveSentryRuntimeMode,
  type SentryEnvironment,
} from '../../shared/config/sentry';
import {
  resolveBrowserSentryRuntimeEnv,
  resolveServerSentryRuntimeEnv,
  type BrowserSentryRuntimeEnv,
  type ServerSentryRuntimeEnv,
} from './env';
import { beforeBrowserSentryBreadcrumb, beforeSendBrowserSentryEvent } from './browser-filtering';

type SentryRuntimeOptions = {
  dsn: string;
  environment: SentryEnvironment;
  release: string;
  tracesSampleRate: number;
};

const parseSentryTracesSampleRate = (value: string | undefined): number => {
  if (!value) {
    return 0.1;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error(
      '[config] NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE must be a number between 0 and 1.',
    );
  }

  return parsed;
};

const getEnabledSentryRuntimeOptions = (
  env: BrowserSentryRuntimeEnv | ServerSentryRuntimeEnv,
  dsn: string | undefined,
): SentryRuntimeOptions | null => {
  const runtimeMode = resolveSentryRuntimeMode({
    enabled: env.NEXT_PUBLIC_SENTRY_ENABLED,
    environment: env.NEXT_PUBLIC_SENTRY_ENV,
  });

  if (!runtimeMode.enabled) {
    return null;
  }

  if (!dsn) {
    throw new Error('[config] A Sentry DSN is required when Sentry is enabled.');
  }

  const gitSha = resolveSentryReleaseSha(env);
  if (!gitSha) {
    throw new Error(
      '[config] A Sentry release SHA is required when Sentry is enabled. Expected SENTRY_RELEASE_SHA, VERCEL_GIT_COMMIT_SHA, or GIT_COMMIT_SHA.',
    );
  }

  return {
    dsn,
    environment: runtimeMode.environment,
    release: buildSentryRelease({
      environment: runtimeMode.environment,
      gitSha,
    }),
    tracesSampleRate: parseSentryTracesSampleRate(env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  };
};

export const getBrowserSentryRuntimeOptions = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
) => {
  const env = resolveBrowserSentryRuntimeEnv(source);
  const options = getEnabledSentryRuntimeOptions(env, env.NEXT_PUBLIC_SENTRY_DSN);

  if (!options) {
    return null;
  }

  return {
    ...options,
    beforeBreadcrumb: beforeBrowserSentryBreadcrumb,
    beforeSend: beforeSendBrowserSentryEvent,
    denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i],
    ignoreErrors: ['AbortError', 'The operation was aborted.'],
  };
};

export const getServerSentryRuntimeOptions = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
) => {
  const env = resolveServerSentryRuntimeEnv(source);
  return getEnabledSentryRuntimeOptions(env, env.SENTRY_DSN);
};

export const getEdgeSentryRuntimeOptions = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
) => {
  const env = resolveServerSentryRuntimeEnv(source);
  return getEnabledSentryRuntimeOptions(env, env.SENTRY_DSN);
};
