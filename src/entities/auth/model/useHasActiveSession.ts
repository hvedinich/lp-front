import { useQuery } from '@tanstack/react-query';
import { getAuthSessionState } from '../api/session';
import { authQueryKeys } from './queryKeys';
import type { AuthSession } from './types';

interface UseHasActiveSessionOptions {
  enabled: boolean;
}

export const useHasActiveSession = ({ enabled }: UseHasActiveSessionOptions) => {
  return useQuery<AuthSession>({
    queryKey: authQueryKeys.session(),
    queryFn: getAuthSessionState,
    enabled,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });
};
