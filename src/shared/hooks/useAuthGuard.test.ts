import { resolveAuthGuardState } from './useAuthGuard';

describe('resolveAuthGuardState', () => {
  it('skips checks for public routes', () => {
    expect(
      resolveAuthGuardState({
        isPublic: true,
        isRouterReady: true,
        isSessionPending: false,
        sessionState: 'unauthenticated',
      }),
    ).toEqual({
      isCheckingAuth: false,
      shouldRedirectToLogin: false,
    });
  });

  it('requests redirect only for explicit unauthenticated state', () => {
    expect(
      resolveAuthGuardState({
        isPublic: false,
        isRouterReady: true,
        isSessionPending: false,
        sessionState: 'unauthenticated',
      }),
    ).toEqual({
      isCheckingAuth: false,
      shouldRedirectToLogin: true,
    });
  });

  it('does not redirect when auth status is unknown', () => {
    expect(
      resolveAuthGuardState({
        isPublic: false,
        isRouterReady: true,
        isSessionPending: false,
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
        sessionState: undefined,
      }),
    ).toEqual({
      isCheckingAuth: true,
      shouldRedirectToLogin: false,
    });
  });
});

