import { z } from 'zod';
import { emptyStringToUndefined, parseOrThrow } from './shared';

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

export const resolveBuildEnv = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): BuildEnv => parseOrThrow(buildEnvSchema, 'Invalid build environment variables', source);
