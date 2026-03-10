import * as Sentry from '@sentry/nextjs';
import { getEdgeSentryRuntimeOptions } from '@/shared/config';

// Next.js loads this file from instrumentation.ts for the edge runtime.
const sentryOptions = getEdgeSentryRuntimeOptions();

if (sentryOptions) {
  Sentry.init(sentryOptions);
}
