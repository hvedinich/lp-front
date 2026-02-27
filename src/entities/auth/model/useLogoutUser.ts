import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { logoutUser } from '../api/logout';
import { authQueryKeys } from './queryKeys';

export const useLogoutUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, void>({
    mutationFn: logoutUser,
    onSettled: async () => {
      // Set session to false explicitly so LoginPage does not immediately
      // re-fetch and redirect back while the cache entry would otherwise trigger
      // a background refetch that could still return an active session.
      queryClient.setQueryData(authQueryKeys.session(), false);
      await router.replace('/login');
    },
  });
};
