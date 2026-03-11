import { z } from 'zod';
import { deriveAppUrl } from '../../../src/shared/config/env/app-url';
import { resolvePublicEnv } from '../../../src/shared/config/env/public';
import { resolveServerRuntimeEnv } from '../../../src/shared/config/env/server';
import { emptyStringToUndefined, parseOrThrow } from '../../../src/shared/config/env/shared';

const testEnvSchema = z.object({
  PLAYWRIGHT_DEBUG_ARTIFACTS: z.preprocess(emptyStringToUndefined, z.string().optional()),
  PLAYWRIGHT_E2E_EMAIL: z.preprocess(
    emptyStringToUndefined,
    z.email().default('playwright-e2e@localprof.dev'),
  ),
  PLAYWRIGHT_E2E_PASSWORD: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).default('PlaywrightE2E123!'),
  ),
  PLAYWRIGHT_LOCATION_PREFIX: z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).default('PW-E2E'),
  ),
  PLAYWRIGHT_WORKERS: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().max(16).optional(),
  ),
});

const isCi = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized !== '0' && normalized !== 'false';
};

const publicEnv = resolvePublicEnv();
const serverEnv = resolveServerRuntimeEnv();
const testRuntimeEnv = parseOrThrow(
  testEnvSchema,
  'Invalid test environment variables',
  process.env as Record<string, unknown>,
);

export const testEnv = {
  app: {
    apiUrl: publicEnv.NEXT_PUBLIC_API_URL,
    port: serverEnv.PORT,
    url: deriveAppUrl({
      explicitSiteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
      port: serverEnv.PORT,
      publicVercelUrl: publicEnv.NEXT_PUBLIC_VERCEL_URL,
      runtimeVercelUrl: serverEnv.VERCEL_URL,
    }),
  },
  playwright: {
    debugArtifacts: isCi(testRuntimeEnv.PLAYWRIGHT_DEBUG_ARTIFACTS),
    e2eEmail: testRuntimeEnv.PLAYWRIGHT_E2E_EMAIL,
    e2ePassword: testRuntimeEnv.PLAYWRIGHT_E2E_PASSWORD,
    isCi: isCi(serverEnv.CI),
    locationPrefix: testRuntimeEnv.PLAYWRIGHT_LOCATION_PREFIX,
    workers: testRuntimeEnv.PLAYWRIGHT_WORKERS,
  },
} as const;
