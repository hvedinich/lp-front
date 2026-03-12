import { z } from 'zod';

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim() === '' ? undefined : value;
};

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(
    emptyStringToUndefined,
    z.url().default('http://localhost:3000'),
  ),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.preprocess(emptyStringToUndefined, z.string().default('en')),
  NEXT_PUBLIC_LOCALES: z.preprocess(emptyStringToUndefined, z.string().default('en,pl,ru')),
  NEXT_PUBLIC_SITE_URL: z.preprocess(emptyStringToUndefined, z.url().optional()),
  NEXT_PUBLIC_VERCEL_URL: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_LANDING_URL: z.preprocess(
    emptyStringToUndefined,
    z.string().default('https://localprof.com'),
  ),
});

const runtimeEnvSchema = z.object({
  CI: z.string().optional(),
  PORT: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().max(65535).default(4000),
  ),
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
  VERCEL_URL: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

const parseOrThrow = <S extends z.ZodRawShape>(
  schema: z.ZodObject<S>,
  label: string,
  data: Record<string, unknown>,
): z.infer<z.ZodObject<S>> => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(`[config] ${label}\n${issues}`);
};

const isCi = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized !== '0' && normalized !== 'false';
};

const deriveLocalUrl = (port: number): string => `http://localhost:${port}`;
const normalizeVercelUrl = (value: string): string =>
  value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;

const deriveAppUrl = (
  explicitSiteUrl: string | undefined,
  publicVercelUrl: string | undefined,
  vercelUrl: string | undefined,
  port: number,
): string => {
  if (explicitSiteUrl) {
    return explicitSiteUrl;
  }

  const resolvedVercelUrl = publicVercelUrl ?? vercelUrl;
  if (resolvedVercelUrl) {
    return normalizeVercelUrl(resolvedVercelUrl);
  }

  return deriveLocalUrl(port);
};

const pub = parseOrThrow(publicEnvSchema, 'Invalid public environment variables', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  NEXT_PUBLIC_LOCALES: process.env.NEXT_PUBLIC_LOCALES,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  NEXT_PUBLIC_LANDING_URL: process.env.NEXT_PUBLIC_LANDING_URL,
});

const runtime = parseOrThrow(
  runtimeEnvSchema,
  'Invalid runtime environment variables',
  process.env as Record<string, unknown>,
);

const port = runtime.PORT;
const ci = isCi(runtime.CI);
const deploymentUrlCandidates = [
  ['NEXT_PUBLIC_SITE_URL', pub.NEXT_PUBLIC_SITE_URL],
  ['NEXT_PUBLIC_VERCEL_URL', pub.NEXT_PUBLIC_VERCEL_URL],
  ['NEXT_PUBLIC_LANDING_URL', pub.NEXT_PUBLIC_LANDING_URL],
  ['VERCEL_URL', runtime.VERCEL_URL],
] as const;

export const env = {
  app: {
    apiUrl: pub.NEXT_PUBLIC_API_URL,
    defaultLocale: pub.NEXT_PUBLIC_DEFAULT_LOCALE,
    locales: pub.NEXT_PUBLIC_LOCALES,
    port,
    landingUrl: pub.NEXT_PUBLIC_LANDING_URL,
    url: deriveAppUrl(
      pub.NEXT_PUBLIC_SITE_URL,
      pub.NEXT_PUBLIC_VERCEL_URL,
      runtime.VERCEL_URL,
      port,
    ),
  },
  playwright: {
    debugArtifacts: isCi(runtime.PLAYWRIGHT_DEBUG_ARTIFACTS),
    e2eEmail: runtime.PLAYWRIGHT_E2E_EMAIL,
    e2ePassword: runtime.PLAYWRIGHT_E2E_PASSWORD,
    locationPrefix: runtime.PLAYWRIGHT_LOCATION_PREFIX,
    workers: runtime.PLAYWRIGHT_WORKERS,
    isCi: ci,
  },
} as const;

export const resolveAppUrl = (): string => {
  return deriveAppUrl(
    pub.NEXT_PUBLIC_SITE_URL,
    pub.NEXT_PUBLIC_VERCEL_URL,
    runtime.VERCEL_URL,
    port,
  );
};

export const resolveDeploymentAppUrl = (): string => {
  if (!deploymentUrlCandidates.some(([, value]) => value)) {
    const names = deploymentUrlCandidates.map(([name]) => name).join(' or ');

    throw new Error(`[config] A deployed app URL is required. Required one of: ${names}.`);
  }

  return resolveAppUrl();
};
