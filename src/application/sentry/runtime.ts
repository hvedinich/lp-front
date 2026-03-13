import {
  buildSentryRelease,
  resolveSentryReleaseSha,
  resolveSentryRuntimeMode,
  type SentryEnvironment,
} from '@/shared/config';
import {
  getBrowserSentryRuntimeEnv,
  getServerSentryRuntimeEnv,
  type BrowserSentryRuntimeEnv,
  type ServerSentryRuntimeEnv,
} from '@/shared/config';
import { beforeBrowserSentryBreadcrumb, beforeSendBrowserSentryEvent } from './browser-filtering';

type SentryRuntimeOptions = {
  dsn: string;
  environment: SentryEnvironment;
  release?: string;
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

const getBrowserGlobalSentryRelease = (): string | undefined => {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  const sentryRelease = (globalThis as { SENTRY_RELEASE?: { id?: unknown } }).SENTRY_RELEASE;

  return typeof sentryRelease?.id === 'string' && sentryRelease.id.trim().length > 0
    ? sentryRelease.id
    : undefined;
};

const getRequiredEnabledSentryRuntimeOptions = (
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

const getEnabledBrowserSentryRuntimeOptions = (
  env: BrowserSentryRuntimeEnv,
): SentryRuntimeOptions | null => {
  const runtimeMode = resolveSentryRuntimeMode({
    enabled: env.NEXT_PUBLIC_SENTRY_ENABLED,
    environment: env.NEXT_PUBLIC_SENTRY_ENV,
  });

  if (!runtimeMode.enabled) {
    return null;
  }

  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    throw new Error('[config] A Sentry DSN is required when Sentry is enabled.');
  }

  const gitSha = resolveSentryReleaseSha(env);
  const release = env.NEXT_PUBLIC_SENTRY_RELEASE
    ? env.NEXT_PUBLIC_SENTRY_RELEASE
    : gitSha
      ? buildSentryRelease({
          environment: runtimeMode.environment,
          gitSha,
        })
      : getBrowserGlobalSentryRelease();

  return {
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: runtimeMode.environment,
    release,
    tracesSampleRate: parseSentryTracesSampleRate(env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  };
};

export const getBrowserSentryRuntimeOptions = (source?: Record<string, unknown>) => {
  const env = getBrowserSentryRuntimeEnv(source);
  const options = getEnabledBrowserSentryRuntimeOptions(env);

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

export const getServerSentryRuntimeOptions = (source?: Record<string, unknown>) => {
  const env = getServerSentryRuntimeEnv(source);
  const options = getRequiredEnabledSentryRuntimeOptions(env, env.SENTRY_DSN);

  if (!options) {
    return null;
  }

  return options;
};

export const getEdgeSentryRuntimeOptions = (source?: Record<string, unknown>) => {
  const env = getServerSentryRuntimeEnv(source);
  const options = getRequiredEnabledSentryRuntimeOptions(env, env.SENTRY_DSN);

  if (!options) {
    return null;
  }

  return options;
};
