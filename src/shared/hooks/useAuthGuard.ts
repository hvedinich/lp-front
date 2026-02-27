import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { type AuthSessionState, useHasActiveSession } from '@/entities/auth';
import { isPublicRoute } from '@/shared/config';

interface AuthGuardState {
  isCheckingAuth: boolean;
}

interface ResolveAuthGuardStateInput {
  isPublic: boolean;
  isRouterReady: boolean;
  isSessionPending: boolean;
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

  if (!input.isRouterReady || input.isSessionPending) {
    return {
      isCheckingAuth: true,
      shouldRedirectToLogin: false,
    };
  }

  return {
    isCheckingAuth: false,
    shouldRedirectToLogin: input.sessionState === 'unauthenticated',
  };
};

export const useAuthGuard = (): AuthGuardState => {
  const router = useRouter();

  const isPublic = isPublicRoute(router.pathname);
  const sessionQuery = useHasActiveSession({
    enabled: router.isReady && !isPublic,
  });
  const sessionState = sessionQuery.data?.state;

  useEffect(() => {
    const guardState = resolveAuthGuardState({
      isPublic,
      isRouterReady: router.isReady,
      isSessionPending: sessionQuery.isPending,
      sessionState,
    });
    
    if (!router.isReady || !guardState.shouldRedirectToLogin) {
      return;
    }

    const nextPath = encodeURIComponent(router.asPath || '/');
    void router.replace(`/login?next=${nextPath}`);
  }, [router, router.isReady, isPublic, router.asPath, sessionState, sessionQuery.isPending]);

  const { isCheckingAuth } = resolveAuthGuardState({
    isPublic,
    isRouterReady: router.isReady,
    isSessionPending: sessionQuery.isPending,
    sessionState,
  });

  return { isCheckingAuth };
};
