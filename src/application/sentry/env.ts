import { z } from 'zod';
import { emptyStringToUndefined, parseOrThrow } from '../../shared/config/env/shared';

const sentryRuntimeEnvBaseSchema = z.object({
  GIT_COMMIT_SHA: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_ENABLED: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_ENV: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).optional(),
  ),
  SENTRY_RELEASE_SHA: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  VERCEL_GIT_COMMIT_SHA: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

const browserSentryRuntimeEnvSchema = sentryRuntimeEnvBaseSchema.extend({
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

const serverSentryRuntimeEnvSchema = browserSentryRuntimeEnvSchema.extend({
  SENTRY_DSN: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

export type BrowserSentryRuntimeEnv = z.infer<typeof browserSentryRuntimeEnvSchema>;
export type ServerSentryRuntimeEnv = z.infer<typeof serverSentryRuntimeEnvSchema>;

export const resolveBrowserSentryRuntimeEnv = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): BrowserSentryRuntimeEnv =>
  parseOrThrow(
    browserSentryRuntimeEnvSchema,
    'Invalid browser Sentry environment variables',
    source,
  );

export const resolveServerSentryRuntimeEnv = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): ServerSentryRuntimeEnv =>
  parseOrThrow(serverSentryRuntimeEnvSchema, 'Invalid server Sentry environment variables', source);
