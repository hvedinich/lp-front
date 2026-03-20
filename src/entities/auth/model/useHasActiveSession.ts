import { useQuery } from '@tanstack/react-query';
import { authQueryKeys } from '@/entities/_contracts';
import type { QueryHookOptions } from '@/shared/lib';
import { getAuthSessionState } from '../api/session';
import type { AuthSession } from './types';

export const useHasActiveSession = ({ options }: QueryHookOptions<void, AuthSession> = {}) => {
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
