import { captureException, withScope } from '@sentry/core';
import { ApiError, isApiError } from '@/shared/api';

type CaptureAppErrorContext = {
  area?: string;
  operation?: string;
};

const isExpectedApiFailure = (error: ApiError): boolean => {
  if (error.status >= 500) {
    return false;
  }

  if (error.status === 0) {
    return !['network_error', 'timeout'].includes(error.code ?? '');
  }

  if (error.context.path === '/auth/refresh') {
    return false;
  }

  if (
    error.status === 401 &&
    error.code?.toLowerCase() === 'token_expired' &&
    error.context.attempt > 0
  ) {
    return false;
  }

  return error.status >= 400 && error.status < 500;
};

const buildApiErrorFingerprint = (error: ApiError): string[] => {
  return [
    'api-error',
    error.context.method,
    error.context.path,
    error.code ?? 'unknown_code',
    error.status >= 500 || error.status === 0 ? 'server_or_transport' : 'client',
  ];
};

export const captureAppError = (
  error: unknown,
  context: CaptureAppErrorContext = {},
): string | undefined => {
  if (isApiError(error)) {
    if (isExpectedApiFailure(error)) {
      return undefined;
    }

    return withScope((scope) => {
      scope.setFingerprint(buildApiErrorFingerprint(error));
      scope.setTag('error_kind', 'api');
      scope.setTag('http_method', error.context.method);
      scope.setTag('http_status', error.status);
      scope.setTag('request_path', error.context.path);

      if (context.area) {
        scope.setTag('app_area', context.area);
      }

      if (context.operation) {
        scope.setTag('app_operation', context.operation);
      }

      scope.setContext('api_request', {
        attempt: error.context.attempt,
        code: error.code,
        duration_ms: error.durationMs,
        message: error.message,
        method: error.context.method,
        path: error.context.path,
        request_id: error.requestId,
        server_timing: error.serverTiming,
        skip_auth_refresh: error.context.skipAuthRefresh,
        status: error.status,
        url: error.context.url,
      });

      if (error.payload && typeof error.payload === 'object') {
        scope.setContext('api_error_payload', error.payload as Record<string, unknown>);
      }

      return captureException(error);
    });
  }

  if (error instanceof Error) {
    return withScope((scope) => {
      scope.setTag('error_kind', 'unexpected');

      if (context.area) {
        scope.setTag('app_area', context.area);
      }

      if (context.operation) {
        scope.setTag('app_operation', context.operation);
      }

      return captureException(error);
    });
  }

  return withScope((scope) => {
    scope.setTag('error_kind', 'non_error_throwable');

    if (context.area) {
      scope.setTag('app_area', context.area);
    }

    if (context.operation) {
      scope.setTag('app_operation', context.operation);
    }

    return captureException(new Error('Non-Error throwable captured by captureAppError.'));
  });
};
