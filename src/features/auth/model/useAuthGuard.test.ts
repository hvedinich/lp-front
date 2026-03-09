import { resolveAuthGuardState } from './useAuthGuard';

describe('resolveAuthGuardState', () => {
  it('skips checks for public routes', () => {
    expect(
      resolveAuthGuardState({
        isPublic: true,
        isRouterReady: true,
        isSessionPending: false,
        isSessionFetching: false,
        sessionState: 'unauthenticated',
      }),
    ).toEqual({
      isCheckingAuth: false,
      shouldRedirectToLogin: false,
    });
  });

  it('keeps auth check active while redirecting unauthenticated users', () => {
    expect(
      resolveAuthGuardState({
        isPublic: false,
        isRouterReady: true,
        isSessionPending: false,
        isSessionFetching: false,
        sessionState: 'unauthenticated',
      }),
    ).toEqual({
      isCheckingAuth: true,
      shouldRedirectToLogin: true,
    });
  });

  it('does not redirect when auth status is unknown', () => {
    expect(
      resolveAuthGuardState({
        isPublic: false,
        isRouterReady: true,
        isSessionPending: false,
        isSessionFetching: false,
        sessionState: 'unknown',
      }),
    ).toEqual({
      isCheckingAuth: false,
      shouldRedirectToLogin: false,
    });
  });

  it('keeps auth check active while route state is unresolved', () => {
    expect(
      resolveAuthGuardState({
        isPublic: false,
        isRouterReady: false,
        isSessionPending: true,
        isSessionFetching: false,
        sessionState: undefined,
      }),
    ).toEqual({
      isCheckingAuth: true,
      shouldRedirectToLogin: false,
    });
  });

  it('keeps auth check active while session is fetching (prevents redirect loop after login)', () => {
    // Scenario: user just logged in, RQ invalidated session, isFetching=true
    // but cache still has stale 'unauthenticated' data → must NOT redirect.
    expect(
      resolveAuthGuardState({
        isPublic: false,
        isRouterReady: true,
        isSessionPending: false,
        isSessionFetching: true,
        sessionState: 'unauthenticated',
      }),
    ).toEqual({
      isCheckingAuth: true,
      shouldRedirectToLogin: false,
    });
  });

  it('does not show auth loader during background refresh for authenticated session', () => {
    expect(
      resolveAuthGuardState({
        isPublic: false,
        isRouterReady: true,
        isSessionPending: false,
        isSessionFetching: true,
        sessionState: 'authenticated',
      }),
    ).toEqual({
      isCheckingAuth: false,
      shouldRedirectToLogin: false,
    });
  });

  it('does not redirect authenticated user on a protected route', () => {
    expect(
      resolveAuthGuardState({
        isPublic: false,
        isRouterReady: true,
        isSessionPending: false,
        isSessionFetching: false,
        sessionState: 'authenticated',
      }),
    ).toEqual({
      isCheckingAuth: false,
      shouldRedirectToLogin: false,
    });
  });
});
