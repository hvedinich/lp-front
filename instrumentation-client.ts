import * as Sentry from '@sentry/nextjs';
import { getBrowserSentryRuntimeOptions } from '@/application/sentry';

// Next.js loads this file automatically for the browser runtime.
const sentryOptions = getBrowserSentryRuntimeOptions();

if (sentryOptions) {
  console.info('[SENTRY_DEBUG][browser][init]', {
    environment: sentryOptions.environment,
    release: sentryOptions.release,
    tracesSampleRate: sentryOptions.tracesSampleRate,
  });
  Sentry.init(sentryOptions);
} else {
  console.info('[SENTRY_DEBUG][browser][init]', {
    enabled: false,
    reason: 'no-runtime-options',
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
