import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../api/login';
import type { LoginPayload, LoginResponse } from './types';
import { authQueryKeys } from './queryKeys';
import type { MutationHookOptions } from '@/shared/lib';

export const useLoginUser = (
  params: MutationHookOptions<Record<string, never>, LoginResponse, LoginPayload> = {
    scope: {},
  },
) => {
  const queryClient = useQueryClient();
  const { options, scope } = params;
  void scope;

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: (data, variables, context, meta) => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      options?.onSuccess?.(data, variables, context, meta);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
    onMutate: options?.onMutate,
  });
};
