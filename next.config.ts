import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import { getSentryBuildOptions } from './config/sentry/build';

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, getSentryBuildOptions());
