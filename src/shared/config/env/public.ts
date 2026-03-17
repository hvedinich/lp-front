import { z } from 'zod';
import { deriveAppUrl } from './app-url';
import { emptyStringToUndefined, parseEnv } from './core';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(
    emptyStringToUndefined,
    z.url().default('http://localhost:3000'),
  ),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.preprocess(emptyStringToUndefined, z.string().default('en')),
  NEXT_PUBLIC_LOCALES: z.preprocess(emptyStringToUndefined, z.string().default('en,pl,ru')),
  NEXT_PUBLIC_SITE_URL: z.preprocess(emptyStringToUndefined, z.url().optional()),
  NEXT_PUBLIC_VERCEL_URL: z.preprocess(emptyStringToUndefined, z.string().min(1).optional()),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

const publicEnvSource = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  NEXT_PUBLIC_LOCALES: process.env.NEXT_PUBLIC_LOCALES,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
} satisfies Record<string, unknown>;

export const envPublic = parseEnv({
  label: 'Invalid public environment variables',
  schema: publicEnvSchema,
  source: publicEnvSource,
});

export const envApp = {
  app: {
    apiUrl: envPublic.NEXT_PUBLIC_API_URL,
    defaultLocale: envPublic.NEXT_PUBLIC_DEFAULT_LOCALE,
    locales: envPublic.NEXT_PUBLIC_LOCALES,
    url: deriveAppUrl({
      explicitSiteUrl: envPublic.NEXT_PUBLIC_SITE_URL,
      publicVercelUrl: envPublic.NEXT_PUBLIC_VERCEL_URL,
    }),
  },
} as const;
