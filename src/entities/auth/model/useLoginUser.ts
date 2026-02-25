import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../api/login';
import type { LoginPayload, LoginResponse } from './types';
import { authQueryKeys } from './queryKeys';

export const useLoginUser = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
    },
  });
};
