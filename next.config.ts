import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import { getSentryBuildOptions, getSentryBuildReleaseName } from './config/sentry/build';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SENTRY_RELEASE: getSentryBuildReleaseName(),
  },
};

export default withSentryConfig(nextConfig, getSentryBuildOptions());
