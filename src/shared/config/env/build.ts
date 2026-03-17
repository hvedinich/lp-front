import { z } from 'zod';
import { emptyStringToUndefined, parseEnv } from './core';

const buildEnvSchema = z.object({
  CI: z.preprocess(emptyStringToUndefined, z.string().optional()),
  GIT_COMMIT_SHA: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_ENABLED: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SENTRY_ENV: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  SENTRY_AUTH_TOKEN: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  SENTRY_ORG: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  SENTRY_PROJECT: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  SENTRY_RELEASE_SHA: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  VERCEL_GIT_COMMIT_SHA: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

export type BuildEnv = z.infer<typeof buildEnvSchema>;

const parseBuildEnv = (source: Record<string, unknown>): BuildEnv =>
  parseEnv({
    label: 'Invalid build environment variables',
    schema: buildEnvSchema,
    source,
  });

export const envBuild = parseBuildEnv(process.env as Record<string, unknown>);

export const getBuildEnv = (source?: Record<string, unknown>): BuildEnv =>
  source ? parseBuildEnv(source) : envBuild;
