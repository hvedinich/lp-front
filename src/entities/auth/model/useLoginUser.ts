import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../api/login';
import type { LoginPayload, LoginResponse } from './types';
import { authQueryKeys } from './queryKeys';
import type { MutationCallbacks } from '@/shared/lib';

export const useLoginUser = (options?: MutationCallbacks<LoginResponse, LoginPayload>) => {
  const queryClient = useQueryClient();

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
