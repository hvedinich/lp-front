import { ApiError } from './ApiError';
import { getLoginRedirectTarget, shouldRedirectToLoginOnAuthError } from './client';

const createApiError = (path: string, status: number): ApiError => {
  return new ApiError({
    code: 'ANY',
    context: {
      attempt: 0,
      method: 'GET',
      path,
      skipAuthRefresh: false,
      url: `https://api.test${path}`,
    },
    durationMs: 1,
    message: 'Request failed',
    status,
  });
};

describe('shared api auth redirect', () => {
  it('redirects on refresh 401 failures', () => {
    const error = createApiError('/auth/refresh', 401);
    expect(shouldRedirectToLoginOnAuthError(error)).toBe(true);
  });

  it('does not redirect on non-refresh 401 failures', () => {
    const error = createApiError('/auth/me', 401);
    expect(shouldRedirectToLoginOnAuthError(error)).toBe(false);
  });

  it('does not redirect on non-ApiError values', () => {
    expect(shouldRedirectToLoginOnAuthError(new Error('x'))).toBe(false);
  });

  it('builds login redirect target with next path', () => {
    expect(getLoginRedirectTarget('/dashboard?tab=reports')).toBe(
      '/login?next=%2Fdashboard%3Ftab%3Dreports',
    );
  });

  it('skips redirect target generation for login and signup routes', () => {
    expect(getLoginRedirectTarget('/login')).toBe(null);
    expect(getLoginRedirectTarget('/signup?from=invite')).toBe(null);
  });
});
