import { z } from 'zod';
import { emptyStringToUndefined, parseEnv } from './core';

const sentryRuntimeEnvBaseSchema = z.object({
  GIT_COMMIT_SHA: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_ENABLED: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_ENV: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_RELEASE: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
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

const browserSentryRuntimeEnvSource = {
  GIT_COMMIT_SHA: process.env.GIT_COMMIT_SHA,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENABLED: process.env.NEXT_PUBLIC_SENTRY_ENABLED,
  NEXT_PUBLIC_SENTRY_ENV: process.env.NEXT_PUBLIC_SENTRY_ENV,
  NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
  SENTRY_RELEASE_SHA: process.env.SENTRY_RELEASE_SHA,
  VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
} satisfies Record<string, unknown>;

const parseBrowserSentryRuntimeEnv = (source: Record<string, unknown>): BrowserSentryRuntimeEnv =>
  parseEnv({
    label: 'Invalid browser Sentry environment variables',
    schema: browserSentryRuntimeEnvSchema,
    source,
  });

const parseServerSentryRuntimeEnv = (source: Record<string, unknown>): ServerSentryRuntimeEnv =>
  parseEnv({
    label: 'Invalid server Sentry environment variables',
    schema: serverSentryRuntimeEnvSchema,
    source,
  });

export const envBrowserSentry = parseBrowserSentryRuntimeEnv(browserSentryRuntimeEnvSource);

export const envServerSentry = parseServerSentryRuntimeEnv(process.env as Record<string, unknown>);

export const getBrowserSentryRuntimeEnv = (
  source?: Record<string, unknown>,
): BrowserSentryRuntimeEnv => (source ? parseBrowserSentryRuntimeEnv(source) : envBrowserSentry);

export const getServerSentryRuntimeEnv = (
  source?: Record<string, unknown>,
): ServerSentryRuntimeEnv => (source ? parseServerSentryRuntimeEnv(source) : envServerSentry);
