import { z } from 'zod';
import { deriveAppUrl } from './app-url';
import { resolvePublicEnv } from './public';
import { emptyStringToUndefined, parseOrThrow } from './shared';

const serverRuntimeEnvSchema = z.object({
  CI: z.string().optional(),
  PORT: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().max(65535).default(4000),
  ),
  VERCEL_URL: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

export type ServerRuntimeEnv = z.infer<typeof serverRuntimeEnvSchema>;

export const resolveServerRuntimeEnv = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): ServerRuntimeEnv =>
  parseOrThrow(serverRuntimeEnvSchema, 'Invalid runtime environment variables', source);

export const resolveAppUrl = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): string => {
  const publicEnv = resolvePublicEnv();
  const serverEnv = resolveServerRuntimeEnv(source);

  return deriveAppUrl({
    explicitSiteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
    port: serverEnv.PORT,
    publicVercelUrl: publicEnv.NEXT_PUBLIC_VERCEL_URL,
    runtimeVercelUrl: serverEnv.VERCEL_URL,
  });
};

export const resolveDeploymentAppUrl = (
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): string => {
  const publicEnv = resolvePublicEnv();
  const serverEnv = resolveServerRuntimeEnv(source);
  const deploymentUrlCandidates = [
    ['NEXT_PUBLIC_SITE_URL', publicEnv.NEXT_PUBLIC_SITE_URL],
    ['NEXT_PUBLIC_VERCEL_URL', publicEnv.NEXT_PUBLIC_VERCEL_URL],
    ['VERCEL_URL', serverEnv.VERCEL_URL],
  ] as const;

  if (!deploymentUrlCandidates.some(([, value]) => value)) {
    const names = deploymentUrlCandidates.map(([name]) => name).join(' or ');

    throw new Error(`[config] A deployed app URL is required. Required one of: ${names}.`);
  }

  return resolveAppUrl(source);
};
