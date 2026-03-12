import { z } from 'zod';
import { deriveAppUrl } from './app-url';
import { envPublic } from './public';
import { emptyStringToUndefined, parseEnv } from './core';

const serverRuntimeEnvSchema = z.object({
  CI: z.string().optional(),
  PORT: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().max(65535).default(4000),
  ),
  VERCEL_URL: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

export type ServerRuntimeEnv = z.infer<typeof serverRuntimeEnvSchema>;

const parseServerRuntimeEnv = (source: Record<string, unknown>): ServerRuntimeEnv =>
  parseEnv({
    label: 'Invalid runtime environment variables',
    schema: serverRuntimeEnvSchema,
    source,
  });

export const envServer = parseServerRuntimeEnv(process.env as Record<string, unknown>);

const getServerRuntimeEnv = (source?: Record<string, unknown>): ServerRuntimeEnv =>
  source ? parseServerRuntimeEnv(source) : envServer;

export const resolveAppUrl = (source?: Record<string, unknown>): string => {
  const serverEnv = getServerRuntimeEnv(source);

  return deriveAppUrl({
    explicitSiteUrl: envPublic.NEXT_PUBLIC_SITE_URL,
    port: serverEnv.PORT,
    publicVercelUrl: envPublic.NEXT_PUBLIC_VERCEL_URL,
    runtimeVercelUrl: serverEnv.VERCEL_URL,
  });
};

export const resolveDeploymentAppUrl = (source?: Record<string, unknown>): string => {
  const serverEnv = getServerRuntimeEnv(source);
  const deploymentUrlCandidates = [
    ['NEXT_PUBLIC_SITE_URL', envPublic.NEXT_PUBLIC_SITE_URL],
    ['NEXT_PUBLIC_VERCEL_URL', envPublic.NEXT_PUBLIC_VERCEL_URL],
    ['VERCEL_URL', serverEnv.VERCEL_URL],
  ] as const;

  if (!deploymentUrlCandidates.some(([, value]) => value)) {
    const names = deploymentUrlCandidates.map(([name]) => name).join(' or ');

    throw new Error(`[config] A deployed app URL is required. Required one of: ${names}.`);
  }

  return resolveAppUrl(source);
};
