import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sentryCore from '@sentry/core';
import { ApiError } from '@/shared/api';
import { captureAppError } from './captureAppError';

vi.mock('@sentry/core', () => ({
  captureException: vi.fn(),
  withScope: vi.fn(),
}));

type MockFn = {
  mock: {
    calls: unknown[][];
  };
  mockImplementation: (implementation: (...args: never[]) => unknown) => unknown;
  mockImplementationOnce: (implementation: (...args: never[]) => unknown) => unknown;
  mockReset: () => void;
  mockReturnValueOnce: (value: unknown) => unknown;
};

const captureExceptionMock = sentryCore.captureException as unknown as MockFn;
const withScopeMock = sentryCore.withScope as unknown as MockFn;

type ScopeRecorder = {
  contexts: Record<string, Record<string, unknown>>;
  fingerprints: string[][];
  tags: Record<string, unknown>;
};

const createApiError = (overrides: Partial<ConstructorParameters<typeof ApiError>[0]> = {}) => {
  return new ApiError({
    code: 'validation_failed',
    context: {
      attempt: 0,
      method: 'POST',
      path: '/locations',
      skipAuthRefresh: false,
      url: 'https://api.test/locations',
    },
    durationMs: 120,
    message: 'Request failed',
    status: 400,
    ...overrides,
  });
};

const createScopeRecorder = (): ScopeRecorder => {
  return {
    contexts: {},
    fingerprints: [],
    tags: {},
  };
};

describe('captureAppError', () => {
  beforeEach(() => {
    captureExceptionMock.mockReset();
    withScopeMock.mockImplementation((callback: (scope: unknown) => unknown) => {
      const recorder = createScopeRecorder();

      return callback({
        setContext: (name: string, value: Record<string, unknown>) => {
          recorder.contexts[name] = value;
        },
        setFingerprint: (value: string[]) => {
          recorder.fingerprints.push(value);
        },
        setTag: (key: string, value: unknown) => {
          recorder.tags[key] = value;
        },
      });
    });
  });

  it('skips expected client-side 4xx API failures', () => {
    const error = createApiError();

    expect(captureAppError(error)).toBe(undefined);
    expect(captureExceptionMock.mock.calls.length).toBe(0);
  });

  it('captures 5xx API failures with fingerprint and request context', () => {
    const error = createApiError({
      code: 'internal_error',
      message: 'Internal server error',
      payload: { detail: 'boom' },
      requestId: 'req-123',
      serverTiming: 'db;dur=20',
      status: 503,
    });
    const scope = createScopeRecorder();

    withScopeMock.mockImplementationOnce((callback: (scope: unknown) => unknown) => {
      return callback({
        setContext: (name: string, value: Record<string, unknown>) => {
          scope.contexts[name] = value;
        },
        setFingerprint: (value: string[]) => {
          scope.fingerprints.push(value);
        },
        setTag: (key: string, value: unknown) => {
          scope.tags[key] = value;
        },
      });
    });
    captureExceptionMock.mockReturnValueOnce('event-503');

    expect(captureAppError(error, { area: 'devices', operation: 'load-list' })).toBe('event-503');
    expect(captureExceptionMock.mock.calls).toEqual([[error]]);
    expect(scope.fingerprints).toEqual([
      ['api-error', 'POST', '/locations', 'internal_error', 'server_or_transport'],
    ]);
    expect(scope.tags).toEqual({
      app_area: 'devices',
      app_operation: 'load-list',
      error_kind: 'api',
      http_method: 'POST',
      http_status: 503,
      request_path: '/locations',
    });
    expect(scope.contexts.api_request).toEqual({
      attempt: 0,
      code: 'internal_error',
      duration_ms: 120,
      message: 'Internal server error',
      method: 'POST',
      path: '/locations',
      request_id: 'req-123',
      server_timing: 'db;dur=20',
      skip_auth_refresh: false,
      status: 503,
      url: 'https://api.test/locations',
    });
    expect(scope.contexts.api_error_payload).toEqual({ detail: 'boom' });
  });

  it('captures auth refresh failures even when they are 4xx', () => {
    const error = createApiError({
      context: {
        attempt: 0,
        method: 'POST',
        path: '/auth/refresh',
        skipAuthRefresh: true,
        url: 'https://api.test/auth/refresh',
      },
      status: 401,
    });

    captureAppError(error);

    expect(captureExceptionMock.mock.calls).toEqual([[error]]);
  });

  it('captures transport errors but skips unknown status=0 failures', () => {
    const transportError = createApiError({
      code: 'network_error',
      status: 0,
    });
    const unknownZeroStatusError = createApiError({
      code: 'aborted_by_user',
      status: 0,
    });

    captureAppError(transportError);
    expect(captureExceptionMock.mock.calls).toEqual([[transportError]]);

    captureExceptionMock.mockReset();

    expect(captureAppError(unknownZeroStatusError)).toBe(undefined);
    expect(captureExceptionMock.mock.calls.length).toBe(0);
  });
});
