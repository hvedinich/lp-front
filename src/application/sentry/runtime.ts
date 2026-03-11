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

type SentryRuntimeLogContext = {
  hasDsn: boolean;
  hasReleaseSha: boolean;
  nextPublicEnabled: string | null;
  nextPublicEnv: string | null;
  tracesSampleRate: string | null;
};

const logSentryRuntimeDebug = (
  runtime: 'browser' | 'server' | 'edge',
  stage: 'env' | 'options',
  payload: Record<string, unknown>,
): void => {
  console.info(`[SENTRY_DEBUG][${runtime}][${stage}]`, payload);
};

const buildRuntimeLogContext = (
  env: BrowserSentryRuntimeEnv | ServerSentryRuntimeEnv,
  dsn: string | undefined,
): SentryRuntimeLogContext => ({
  hasDsn: Boolean(dsn),
  hasReleaseSha: Boolean(resolveSentryReleaseSha(env)),
  nextPublicEnabled: env.NEXT_PUBLIC_SENTRY_ENABLED ?? null,
  nextPublicEnv: env.NEXT_PUBLIC_SENTRY_ENV ?? null,
  tracesSampleRate: env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? null,
});

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
  logSentryRuntimeDebug('browser', 'env', buildRuntimeLogContext(env, env.NEXT_PUBLIC_SENTRY_DSN));
  const options = getEnabledSentryRuntimeOptions(env, env.NEXT_PUBLIC_SENTRY_DSN);

  if (!options) {
    logSentryRuntimeDebug('browser', 'options', { enabled: false, reason: 'runtime-disabled' });
    return null;
  }

  logSentryRuntimeDebug('browser', 'options', {
    enabled: true,
    environment: options.environment,
    release: options.release,
    tracesSampleRate: options.tracesSampleRate,
  });

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
  logSentryRuntimeDebug('server', 'env', buildRuntimeLogContext(env, env.SENTRY_DSN));
  const options = getEnabledSentryRuntimeOptions(env, env.SENTRY_DSN);

  if (!options) {
    logSentryRuntimeDebug('server', 'options', { enabled: false, reason: 'runtime-disabled' });
    return null;
  }

  logSentryRuntimeDebug('server', 'options', {
    enabled: true,
    environment: options.environment,
    release: options.release,
    tracesSampleRate: options.tracesSampleRate,
  });

  return options;
};

export const getEdgeSentryRuntimeOptions = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
) => {
  const env = resolveServerSentryRuntimeEnv(source);
  logSentryRuntimeDebug('edge', 'env', buildRuntimeLogContext(env, env.SENTRY_DSN));
  const options = getEnabledSentryRuntimeOptions(env, env.SENTRY_DSN);

  if (!options) {
    logSentryRuntimeDebug('edge', 'options', { enabled: false, reason: 'runtime-disabled' });
    return null;
  }

  logSentryRuntimeDebug('edge', 'options', {
    enabled: true,
    environment: options.environment,
    release: options.release,
    tracesSampleRate: options.tracesSampleRate,
  });

  return options;
};
