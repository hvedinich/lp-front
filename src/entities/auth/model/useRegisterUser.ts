import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUser } from '../api/register';
import type { RegisterPayload, RegisterResponse } from './types';
import { authQueryKeys } from './queryKeys';

export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: registerUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
    },
  });
};
