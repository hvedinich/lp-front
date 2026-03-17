import { ApiError } from '@/shared/api';
import { mapToPlaceError } from './errors';

const createApiError = (options: {
  code?: string | null;
  message?: string;
  payload?: unknown;
  status: number;
}) =>
  new ApiError({
    code: options.code,
    context: {
      attempt: 0,
      method: 'GET',
      path: '/places/search',
      skipAuthRefresh: false,
      url: 'https://api.test/places/search',
    },
    durationMs: 1,
    message: options.message ?? 'Request failed',
    payload: options.payload,
    status: options.status,
  });

describe('mapToPlaceError', () => {
  it('maps status 404 to NOT_FOUND', () => {
    const error = createApiError({
      payload: { error: { message: 'Place not found' } },
      status: 404,
    });

    expect(mapToPlaceError(error)).toEqual({
      code: 'NOT_FOUND',
      issues: undefined,
      message: 'Place not found',
    });
  });

  it('maps status 0 to NETWORK', () => {
    const error = createApiError({
      message: 'Network down',
      status: 0,
    });

    expect(mapToPlaceError(error)).toEqual({
      code: 'NETWORK',
      message: 'Network down',
    });
  });

  it('maps unknown status codes to UNKNOWN', () => {
    const error = createApiError({
      payload: { error: { message: 'Server exploded' } },
      status: 500,
    });

    expect(mapToPlaceError(error)).toEqual({
      code: 'UNKNOWN',
      issues: undefined,
      message: 'Server exploded',
    });
  });

  it('maps unrecognised explicit error codes to UNKNOWN', () => {
    const error = createApiError({
      code: 'SOME_UNEXPECTED_CODE',
      payload: { error: { message: 'Something unexpected' } },
      status: 422,
    });

    expect(mapToPlaceError(error)).toEqual({
      code: 'UNKNOWN',
      issues: undefined,
      message: 'Something unexpected',
    });
  });
});
