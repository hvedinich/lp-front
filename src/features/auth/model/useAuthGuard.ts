import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { type AuthSessionState, useHasActiveSession } from '@/entities/auth';
import { buildLoginRedirect, isPublicRoute } from '@/shared/config';

interface AuthGuardState {
  isCheckingAuth: boolean;
}

interface ResolveAuthGuardStateInput {
  isPublic: boolean;
  isRouterReady: boolean;
  isSessionPending: boolean;
  isSessionFetching: boolean;
  sessionState: AuthSessionState | undefined;
}

interface ResolveAuthGuardStateResult {
  isCheckingAuth: boolean;
  shouldRedirectToLogin: boolean;
}

export const resolveAuthGuardState = (
  input: ResolveAuthGuardStateInput,
): ResolveAuthGuardStateResult => {
  if (input.isPublic) {
    return {
      isCheckingAuth: false,
      shouldRedirectToLogin: false,
    };
  }

  if (!input.isRouterReady || input.isSessionPending || input.isSessionFetching) {
    const isBackgroundSessionRefresh =
      input.isSessionFetching && input.sessionState === 'authenticated';

    if (isBackgroundSessionRefresh) {
      return {
        isCheckingAuth: false,
        shouldRedirectToLogin: false,
      };
    }

    return {
      isCheckingAuth: true,
      shouldRedirectToLogin: false,
    };
  }

  const shouldRedirectToLogin = input.sessionState === 'unauthenticated';

  return {
    isCheckingAuth: shouldRedirectToLogin,
    shouldRedirectToLogin,
  };
};

export const useAuthGuard = (): AuthGuardState => {
  const router = useRouter();

  const isPublic = isPublicRoute(router.pathname);
  const sessionQuery = useHasActiveSession({
    options: {
      enabled: router.isReady && !isPublic,
    },
  });
  const sessionState = sessionQuery.data?.state;
  const guardState = resolveAuthGuardState({
    isPublic,
    isRouterReady: router.isReady,
    isSessionPending: sessionQuery.isPending,
    isSessionFetching: sessionQuery.isFetching,
    sessionState,
  });

  useEffect(() => {
    if (!router.isReady || !guardState.shouldRedirectToLogin) {
      return;
    }

    const target = buildLoginRedirect(router.asPath || '/');
    if (!target) {
      return;
    }

    void router.replace(target);
  }, [guardState.shouldRedirectToLogin, router, router.asPath, router.isReady]);

  return { isCheckingAuth: guardState.isCheckingAuth };
};
