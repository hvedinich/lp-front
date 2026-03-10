import { ApiError } from '@/shared/api';
import { mapToLocationError } from './errors';

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
      path: '/locations',
      skipAuthRefresh: false,
      url: 'https://api.test/locations',
    },
    durationMs: 1,
    message: options.message ?? 'Request failed',
    payload: options.payload,
    status: options.status,
  });
};

describe('mapToLocationError', () => {
  it('maps explicit FORBIDDEN code', () => {
    const error = createApiError({
      code: 'FORBIDDEN',
      payload: { error: { message: 'Forbidden by policy' } },
      status: 403,
    });

    expect(mapToLocationError(error)).toEqual({
      code: 'FORBIDDEN',
      issues: undefined,
      message: 'Forbidden by policy',
    });
  });

  it('maps VALIDATION_ERROR and exposes issues', () => {
    const error = createApiError({
      payload: {
        error: {
          code: 'VALIDATION_ERROR',
          issues: [{ message: 'Required', path: 'name' }],
          message: 'Validation failed',
        },
      },
      status: 422,
    });

    expect(mapToLocationError(error)).toEqual({
      code: 'VALIDATION_ERROR',
      issues: [{ message: 'Required', path: 'name' }],
      message: 'Validation failed',
    });
  });

  it('maps status 0 to NETWORK', () => {
    const error = createApiError({
      message: 'Network down',
      status: 0,
    });

    expect(mapToLocationError(error)).toEqual({
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

    expect(mapToLocationError(error)).toEqual({
      code: 'UNKNOWN',
      issues: undefined,
      message: 'Unexpected',
    });
  });

  it('maps non-api errors to UNKNOWN', () => {
    expect(mapToLocationError(new Error('Boom'))).toEqual({
      code: 'UNKNOWN',
      message: 'Boom',
    });
  });
});
