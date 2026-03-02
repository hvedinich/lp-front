import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AuthSession, authQueryKeys, logoutUser } from '@/entities/auth';

interface UseLogoutUserOptions {
  onSettled?: () => void;
}

export const useLogoutUser = (options?: UseLogoutUserOptions) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: logoutUser,
    onSettled: () => {
      // Immediately write unauthenticated state into the cache so the auth
      // guard reacts synchronously (before any router navigation or refetch).
      queryClient.setQueryData<AuthSession>(authQueryKeys.session(), {
        payload: null,
        state: 'unauthenticated',
      });
      options?.onSettled?.();
    },
  });
};
