import { useQuery } from '@tanstack/react-query';
import { getAuthSessionState } from '../api/session';
import { authQueryKeys } from './queryKeys';
import type { AuthSession } from './types';
import type { QueryOptions } from '@/shared/lib';

export const useHasActiveSession = (options?: QueryOptions<AuthSession>) => {
  return useQuery<AuthSession>({
    queryKey: authQueryKeys.session(),
    queryFn: getAuthSessionState,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    ...options,
  });
};
