import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { logoutUser } from '../api/logout';
import { authQueryKeys } from './queryKeys';
import type { MutationCallbacks } from '@/shared/lib';

export const useLogoutUser = (options?: MutationCallbacks) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, void>({
    mutationFn: logoutUser,
    onSettled: async (data, error, variables, context, meta) => {
      // Set session to false explicitly so LoginPage does not immediately
      // re-fetch and redirect back while the cache entry would otherwise trigger
      // a background refetch that could still return an active session.
      queryClient.setQueryData(authQueryKeys.session(), false);
      await router.replace('/login');
      options?.onSettled?.(data, error, variables, context, meta);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onMutate: options?.onMutate,
  });
};
