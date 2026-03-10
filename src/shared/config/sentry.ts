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

type SentryReleaseEnv = Partial<
  Record<'GIT_COMMIT_SHA' | 'SENTRY_RELEASE_SHA' | 'VERCEL_GIT_COMMIT_SHA', string | undefined>
>;

type SentryCommonRuntimeEnv = SentryReleaseEnv &
  Partial<
    Record<
      | 'NEXT_PUBLIC_SENTRY_DSN'
      | 'NEXT_PUBLIC_SENTRY_ENABLED'
      | 'NEXT_PUBLIC_SENTRY_ENV'
      | 'NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE',
      string | undefined
    >
  >;

type SentryServerRuntimeEnv = SentryCommonRuntimeEnv &
  Partial<Record<'SENTRY_DSN', string | undefined>>;

type SentryRuntimeOptions = {
  dsn: string;
  environment: SentryEnvironment;
  release: string;
  tracesSampleRate: number;
};

const normalizeEnvString = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
};

const normalizeBooleanFlag = (value: string | undefined): boolean => {
  const normalized = normalizeEnvString(value)?.toLowerCase();

  if (!normalized) {
    return false;
  }

  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
};

export const resolveSentryRuntimeMode = ({
  enabled,
  environment,
}: ResolveSentryRuntimeModeInput): SentryRuntimeMode => {
  if (!normalizeBooleanFlag(enabled)) {
    return { enabled: false };
  }

  const normalizedEnvironment = normalizeEnvString(environment);

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
  const normalizedGitSha = normalizeEnvString(gitSha);

  if (!normalizedGitSha) {
    throw new Error('[config] A git SHA is required to build the Sentry release name.');
  }

  return `${appName}@${normalizedGitSha}-${environment}`;
};

export const resolveSentryReleaseSha = (env: SentryReleaseEnv): string | undefined => {
  return (
    normalizeEnvString(env.SENTRY_RELEASE_SHA) ??
    normalizeEnvString(env.VERCEL_GIT_COMMIT_SHA) ??
    normalizeEnvString(env.GIT_COMMIT_SHA)
  );
};

const parseSentryTracesSampleRate = (value: string | undefined): number => {
  const normalized = normalizeEnvString(value);

  if (!normalized) {
    return 0.1;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error(
      '[config] NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE must be a number between 0 and 1.',
    );
  }

  return parsed;
};

const getEnabledSentryRuntimeOptions = (
  env: SentryCommonRuntimeEnv,
  dsn: string | undefined,
): SentryRuntimeOptions | null => {
  const runtimeMode = resolveSentryRuntimeMode({
    enabled: env.NEXT_PUBLIC_SENTRY_ENABLED,
    environment: env.NEXT_PUBLIC_SENTRY_ENV,
  });

  if (!runtimeMode.enabled) {
    return null;
  }

  const normalizedDsn = normalizeEnvString(dsn);
  if (!normalizedDsn) {
    throw new Error('[config] A Sentry DSN is required when Sentry is enabled.');
  }

  const gitSha = resolveSentryReleaseSha(env);
  if (!gitSha) {
    throw new Error(
      '[config] A Sentry release SHA is required when Sentry is enabled. Expected SENTRY_RELEASE_SHA, VERCEL_GIT_COMMIT_SHA, or GIT_COMMIT_SHA.',
    );
  }

  return {
    dsn: normalizedDsn,
    environment: runtimeMode.environment,
    release: buildSentryRelease({
      environment: runtimeMode.environment,
      gitSha,
    }),
    tracesSampleRate: parseSentryTracesSampleRate(env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
  };
};

export const getBrowserSentryRuntimeOptions = (
  env: SentryCommonRuntimeEnv = process.env as SentryCommonRuntimeEnv,
) => {
  const options = getEnabledSentryRuntimeOptions(env, env.NEXT_PUBLIC_SENTRY_DSN);

  if (!options) {
    return null;
  }

  return {
    ...options,
    // Keep client filtering cheap and explicit until real production noise suggests otherwise.
    denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i],
    ignoreErrors: ['AbortError', 'The operation was aborted.'],
  };
};

export const getServerSentryRuntimeOptions = (
  env: SentryServerRuntimeEnv = process.env as SentryServerRuntimeEnv,
) => {
  // Server and edge must use the private DSN contract rather than the public browser variable.
  return getEnabledSentryRuntimeOptions(env, env.SENTRY_DSN);
};

export const getEdgeSentryRuntimeOptions = (
  env: SentryServerRuntimeEnv = process.env as SentryServerRuntimeEnv,
) => {
  return getEnabledSentryRuntimeOptions(env, env.SENTRY_DSN);
};
