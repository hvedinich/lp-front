import { ApiError } from '@/shared/api';
import { getAuthSessionState } from './session';
import { vi, beforeEach } from 'vitest';

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
}));

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();

  return {
    ...actual,
    apiRequest: apiRequestMock,
  };
});

const authSessionPayload = {
  account: {
    contentLanguage: 'en',
    id: 'acc-1',
    name: 'Acme',
    region: 'us',
    role: 'owner',
  },
  user: {
    email: 'test@example.com',
    id: 'user-1',
    isSystemUser: false,
    language: 'en',
    name: 'Test User',
  },
} as const;

const createApiError = (status: number): ApiError =>
  new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'GET',
      path: '/auth/me',
      skipAuthRefresh: false,
      url: 'http://localhost:3000/auth/me',
    },
    durationMs: 1,
    message: 'Request failed',
    status,
  });

describe('getAuthSessionState', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('returns authenticated when /auth/me succeeds', async () => {
    apiRequestMock.mockResolvedValue(authSessionPayload);

    await expect(getAuthSessionState()).resolves.toEqual({
      payload: authSessionPayload,
      state: 'authenticated',
    });
  });

  it('returns unauthenticated when /auth/me returns 401', async () => {
    apiRequestMock.mockRejectedValue(createApiError(401));

    await expect(getAuthSessionState()).resolves.toEqual({
      payload: null,
      state: 'unauthenticated',
    });
  });

  it('returns unknown on transport failures', async () => {
    apiRequestMock.mockRejectedValue(new TypeError('Network down'));

    await expect(getAuthSessionState()).resolves.toEqual({
      payload: null,
      state: 'unknown',
    });
  });
});
