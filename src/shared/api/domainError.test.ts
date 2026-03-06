import { ApiError } from './ApiError';
import { createApiErrorMapper } from './domainError';

const createTestApiError = (options: {
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
      path: '/test',
      skipAuthRefresh: false,
      url: 'https://api.test/test',
    },
    durationMs: 1,
    message: options.message ?? 'Request failed',
    payload: options.payload,
    status: options.status,
  });

describe('createApiErrorMapper', () => {
  const mapTestError = createApiErrorMapper<
    'BAD_REQUEST' | 'FORBIDDEN' | 'NETWORK' | 'UNAUTHORIZED' | 'UNKNOWN'
  >({
    knownCodes: ['BAD_REQUEST', 'FORBIDDEN', 'NETWORK', 'UNAUTHORIZED', 'UNKNOWN'],
    networkCode: 'NETWORK',
    statusMap: {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
    },
    unknownCode: 'UNKNOWN',
    valueAliases: {
      TOKEN_EXPIRED: 'UNAUTHORIZED',
    },
  });

  it('maps aliased backend codes from the top-level api error', () => {
    expect(
      mapTestError(
        createTestApiError({
          code: 'TOKEN_EXPIRED',
          message: 'Access token expired',
          status: 401,
        }),
      ),
    ).toEqual({
      code: 'UNAUTHORIZED',
      issues: undefined,
      message: 'Access token expired',
    });
  });

  it('prefers envelope message and issues when present', () => {
    expect(
      mapTestError(
        createTestApiError({
          payload: {
            error: {
              code: 'FORBIDDEN',
              issues: [{ message: 'No access', path: '/scope' }],
              message: 'Forbidden by policy',
            },
          },
          status: 403,
        }),
      ),
    ).toEqual({
      code: 'FORBIDDEN',
      issues: [{ message: 'No access', path: '/scope' }],
      message: 'Forbidden by policy',
    });
  });

  it('maps transport failures to network code', () => {
    expect(
      mapTestError(
        createTestApiError({
          message: 'Network down',
          status: 0,
        }),
      ),
    ).toEqual({
      code: 'NETWORK',
      message: 'Network down',
    });
  });

  it('maps unknown values to unknown code', () => {
    expect(
      mapTestError(
        createTestApiError({
          code: 'INTERNAL_ERROR',
          payload: { error: { message: 'Internal server error' } },
          status: 500,
        }),
      ),
    ).toEqual({
      code: 'UNKNOWN',
      issues: undefined,
      message: 'Internal server error',
    });
  });
});
