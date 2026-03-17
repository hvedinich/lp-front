import * as Sentry from '@sentry/nextjs';
import { getBrowserSentryRuntimeOptions } from '@/application/sentry/runtime';

// Next.js loads this file automatically for the browser runtime.
const sentryOptions = getBrowserSentryRuntimeOptions();

if (sentryOptions) {
  Sentry.init(sentryOptions);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
