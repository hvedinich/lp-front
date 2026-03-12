import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import { getSentryBuildOptions, getSentryBuildReleaseName } from './config/sentry/build';

const sentryRelease = getSentryBuildReleaseName();

const nextConfig: NextConfig = {
  env: {
    ...(sentryRelease ? { NEXT_PUBLIC_SENTRY_RELEASE: sentryRelease } : {}),
  },
};

export default withSentryConfig(nextConfig, getSentryBuildOptions());
