import { z } from 'zod';
import { deriveAppUrl } from './app-url';
import { emptyStringToUndefined, parseBooleanFlag, parseEnv } from './core';
import { envPublic } from './public';
import { envServer } from './server';

const testRuntimeEnvSchema = z.object({
  PLAYWRIGHT_BASE_URL: z.preprocess(emptyStringToUndefined, z.url().optional()),
  PLAYWRIGHT_DEBUG_ARTIFACTS: z.preprocess(emptyStringToUndefined, z.string().optional()),
  PLAYWRIGHT_E2E_EMAIL: z.preprocess(
    emptyStringToUndefined,
    z.email().default('playwright-e2e@localprof.dev'),
  ),
  PLAYWRIGHT_E2E_LANE: z.preprocess(
    emptyStringToUndefined,
    z.enum(['all', 'app', 'auth']).default('all'),
  ),
  PLAYWRIGHT_E2E_PASSWORD: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).default('PlaywrightE2E123!'),
  ),
  PLAYWRIGHT_E2E_SCOPE: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  PLAYWRIGHT_LOCATION_PREFIX: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).default('PW-E2E'),
  ),
  PLAYWRIGHT_WORKERS: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().max(16).optional(),
  ),
  PLAYWRIGHT_ONBOARDING_DEVICE_SHORT_CODES: z.preprocess(
    emptyStringToUndefined,
    z.string().default('onbording-test'),
  ),
  PLAYWRIGHT_ONBOARDING_DEVICE_IDS: z.preprocess(emptyStringToUndefined, z.string().default('id')),
});

export type TestRuntimeEnv = z.infer<typeof testRuntimeEnvSchema>;

const parseTestRuntimeEnv = (source: Record<string, unknown>): TestRuntimeEnv =>
  parseEnv({
    label: 'Invalid test environment variables',
    schema: testRuntimeEnvSchema,
    source,
  });

export const envTestRuntime = parseTestRuntimeEnv(process.env as Record<string, unknown>);

const normalizeBaseUrl = (value: string): string => value.trim().replace(/\/$/, '');

export const isLocalUrl = (value: string): boolean => {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

const resolvedBaseUrl = normalizeBaseUrl(
  envTestRuntime.PLAYWRIGHT_BASE_URL ??
    deriveAppUrl({
      explicitSiteUrl: envPublic.NEXT_PUBLIC_SITE_URL,
      port: envServer.PORT,
      publicVercelUrl: envPublic.NEXT_PUBLIC_VERCEL_URL,
      runtimeVercelUrl: envServer.VERCEL_URL,
    }),
);

export const envTest = {
  app: {
    apiUrl: envPublic.NEXT_PUBLIC_API_URL,
    port: envServer.PORT,
    url: resolvedBaseUrl,
  },
  playwright: {
    baseUrl: resolvedBaseUrl,
    debugArtifacts: parseBooleanFlag(envTestRuntime.PLAYWRIGHT_DEBUG_ARTIFACTS),
    e2eEmail: envTestRuntime.PLAYWRIGHT_E2E_EMAIL,
    e2ePassword: envTestRuntime.PLAYWRIGHT_E2E_PASSWORD,
    hasExplicitBaseUrl: Boolean(envTestRuntime.PLAYWRIGHT_BASE_URL),
    isCi: parseBooleanFlag(envServer.CI),
    lane: envTestRuntime.PLAYWRIGHT_E2E_LANE,
    locationPrefix: envTestRuntime.PLAYWRIGHT_LOCATION_PREFIX,
    scope: envTestRuntime.PLAYWRIGHT_E2E_SCOPE,
    workers: envTestRuntime.PLAYWRIGHT_WORKERS,
    onboardingDeviceShortCodes:
      envTestRuntime.PLAYWRIGHT_ONBOARDING_DEVICE_SHORT_CODES?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [],
    onboardingDeviceIds:
      envTestRuntime.PLAYWRIGHT_ONBOARDING_DEVICE_IDS?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [],
  },
} as const;
