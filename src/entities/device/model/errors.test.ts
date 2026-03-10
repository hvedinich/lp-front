import { ApiError } from '@/shared/api';
import { mapToDeviceError } from './errors';

const createApiError = (options: {
  code?: string | null;
  message?: string;
  payload?: unknown;
  status: number;
}) => {
  return new ApiError({
    code: options.code,
    context: {
      attempt: 0,
      method: 'GET',
      path: '/devices',
      skipAuthRefresh: false,
      url: 'https://api.test/devices',
    },
    durationMs: 1,
    message: options.message ?? 'Request failed',
    payload: options.payload,
    status: options.status,
  });
};

describe('mapToDeviceError', () => {
  it('maps status 401 to UNAUTHORIZED', () => {
    const error = createApiError({
      payload: { error: { message: 'Unauthorized' } },
      status: 401,
    });

    expect(mapToDeviceError(error)).toEqual({
      code: 'UNAUTHORIZED',
      issues: undefined,
      message: 'Unauthorized',
    });
  });

  it('maps explicit FORBIDDEN code', () => {
    const error = createApiError({
      code: 'FORBIDDEN',
      payload: { error: { message: 'Forbidden by policy' } },
      status: 403,
    });

    expect(mapToDeviceError(error)).toEqual({
      code: 'FORBIDDEN',
      issues: undefined,
      message: 'Forbidden by policy',
    });
  });

  it('maps status 404 to NOT_FOUND', () => {
    const error = createApiError({
      payload: { error: { message: 'Device missing' } },
      status: 404,
    });

    expect(mapToDeviceError(error)).toEqual({
      code: 'NOT_FOUND',
      issues: undefined,
      message: 'Device missing',
    });
  });

  it('maps status 409 to CONFLICT', () => {
    const error = createApiError({
      payload: { error: { message: 'Conflict' } },
      status: 409,
    });

    expect(mapToDeviceError(error)).toEqual({
      code: 'CONFLICT',
      issues: undefined,
      message: 'Conflict',
    });
  });

  it('maps VALIDATION_ERROR and exposes issues', () => {
    const error = createApiError({
      payload: {
        error: {
          code: 'VALIDATION_ERROR',
          issues: [{ message: 'Required', path: 'singleLinkUrl' }],
          message: 'Validation failed',
        },
      },
      status: 422,
    });

    expect(mapToDeviceError(error)).toEqual({
      code: 'VALIDATION_ERROR',
      issues: [{ message: 'Required', path: 'singleLinkUrl' }],
      message: 'Validation failed',
    });
  });

  it('maps status 0 to NETWORK', () => {
    const error = createApiError({
      message: 'Network down',
      status: 0,
    });

    expect(mapToDeviceError(error)).toEqual({
      code: 'NETWORK',
      message: 'Network down',
    });
  });

  it('maps unknown api errors to UNKNOWN', () => {
    const error = createApiError({
      code: 'SOMETHING_NEW',
      payload: {
        error: {
          message: 'Unexpected',
        },
      },
      status: 500,
    });

    expect(mapToDeviceError(error)).toEqual({
      code: 'UNKNOWN',
      issues: undefined,
      message: 'Unexpected',
    });
  });
});
