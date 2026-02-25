import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useHasActiveSession } from '@/entities/auth';
import { isPublicRoute } from '@/shared/config';

interface AuthGuardState {
  isCheckingAuth: boolean;
}

export const useAuthGuard = (): AuthGuardState => {
  const router = useRouter();

  const isPublic = isPublicRoute(router.pathname);
  const sessionQuery = useHasActiveSession({
    enabled: router.isReady && !isPublic,
  });

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (isPublic || sessionQuery.isPending) {
      return;
    }

    if (sessionQuery.data === false) {
      const nextPath = encodeURIComponent(router.asPath || '/');
      void router.replace(`/login?next=${nextPath}`);
    }
  }, [router, router.isReady, isPublic, router.asPath, sessionQuery.data, sessionQuery.isPending]);

  const isCheckingAuth =
    !isPublic && (!router.isReady || sessionQuery.isPending || sessionQuery.data === false);

  return { isCheckingAuth };
};
