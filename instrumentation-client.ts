import * as Sentry from '@sentry/nextjs';
import { getBrowserSentryRuntimeOptions } from '@/shared/config';

// Next.js loads this file automatically for the browser runtime.
const sentryOptions = getBrowserSentryRuntimeOptions();

if (sentryOptions) {
  Sentry.init(sentryOptions);
}
