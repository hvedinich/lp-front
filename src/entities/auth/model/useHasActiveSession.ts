import { useQuery } from '@tanstack/react-query';
import { hasActiveSession } from '../api/session';
import { authQueryKeys } from './queryKeys';

interface UseHasActiveSessionOptions {
  enabled: boolean;
}

export const useHasActiveSession = ({ enabled }: UseHasActiveSessionOptions) => {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: hasActiveSession,
    enabled,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });
};
