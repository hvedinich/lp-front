import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AuthSession, authQueryKeys, logoutUser } from '@/entities/auth';
import { type MutationHookOptions } from '@/shared/lib';

export const useLogoutUser = (
  params: MutationHookOptions<Record<string, never>, void, void, Error> = {
    scope: {},
  },
) => {
  const queryClient = useQueryClient();
  const { options, scope } = params;
  void scope;

  return useMutation<void, Error, void>({
    mutationFn: logoutUser,
    onSettled: (data, error, variables, context, meta) => {
      // Immediately write unauthenticated state into the cache so the auth
      // guard reacts synchronously (before any router navigation or refetch).
      queryClient.setQueryData<AuthSession>(authQueryKeys.session(), {
        payload: null,
        state: 'unauthenticated',
      });
      options?.onSettled?.(data, error, variables, context, meta);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onMutate: options?.onMutate,
  });
};
