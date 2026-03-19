import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authQueryKeys } from '@/entities/_contracts';
import type { MutationHookOptions } from '@/shared/lib';
import { registerUser } from '../api/register';
import type { RegisterPayload, RegisterResponse } from './types';

export const useRegisterUser = (
  params: MutationHookOptions<Record<string, never>, RegisterResponse, RegisterPayload> = {
    scope: {},
  },
) => {
  const queryClient = useQueryClient();
  const { options, scope } = params;
  void scope;

  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: registerUser,
    onSuccess: (data, variables, context, meta) => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      options?.onSuccess?.(data, variables, context, meta);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
    onMutate: options?.onMutate,
  });
};
