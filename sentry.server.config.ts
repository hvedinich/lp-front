import * as Sentry from '@sentry/nextjs';
import { getServerSentryRuntimeOptions } from './src/application/sentry/runtime';

// Next.js loads this file from instrumentation.ts for the node runtime.
const sentryOptions = getServerSentryRuntimeOptions();

if (sentryOptions) {
  Sentry.init(sentryOptions);
}
