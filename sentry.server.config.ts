import * as Sentry from '@sentry/nextjs';
import { getServerSentryRuntimeOptions } from './src/application/sentry';

// Next.js loads this file from instrumentation.ts for the node runtime.
const sentryOptions = getServerSentryRuntimeOptions();

if (sentryOptions) {
  console.info('[SENTRY_DEBUG][server][init]', {
    environment: sentryOptions.environment,
    release: sentryOptions.release,
    tracesSampleRate: sentryOptions.tracesSampleRate,
  });
  Sentry.init(sentryOptions);
} else {
  console.info('[SENTRY_DEBUG][server][init]', {
    enabled: false,
    reason: 'no-runtime-options',
  });
}
