import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardDevice } from '../api/onboarding';
import type { DeviceOnboardingResponse, OnboardPayload } from './types';
import { authQueryKeys } from '@/entities/auth';
import { MutationCallbacks } from '@/shared/lib';

export const useOnboardDevice = (
  options?: MutationCallbacks<DeviceOnboardingResponse, OnboardPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation<DeviceOnboardingResponse, Error, OnboardPayload>({
    mutationFn: onboardDevice,
    onSuccess: (data, variables, context, meta) => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      options?.onSuccess?.(data, variables, context, meta);
    },
  });
};
