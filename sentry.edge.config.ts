import * as Sentry from '@sentry/nextjs';
import { getEdgeSentryRuntimeOptions } from './src/application/sentry';

// Next.js loads this file from instrumentation.ts for the edge runtime.
const sentryOptions = getEdgeSentryRuntimeOptions();

if (sentryOptions) {
  console.info('[SENTRY_DEBUG][edge][init]', {
    environment: sentryOptions.environment,
    release: sentryOptions.release,
    tracesSampleRate: sentryOptions.tracesSampleRate,
  });
  Sentry.init(sentryOptions);
} else {
  console.info('[SENTRY_DEBUG][edge][init]', {
    enabled: false,
    reason: 'no-runtime-options',
  });
}
