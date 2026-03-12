import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardDevice } from '../api/onboarding';
import type { DeviceOnboardingResponse, OnboardPayload } from './types';
import { authQueryKeys } from '@/entities/auth';
import type { MutationHookOptions } from '@/shared/lib';
import { mapToOnboardDeviceError, type OnboardDeviceError } from './errors';

export const useOnboardDevice = (
  params: MutationHookOptions<
    Record<string, never>,
    DeviceOnboardingResponse,
    OnboardPayload,
    OnboardDeviceError
  > = { scope: {} },
) => {
  const queryClient = useQueryClient();
  const { options, scope } = params;
  void scope;

  return useMutation<DeviceOnboardingResponse, OnboardDeviceError, OnboardPayload>({
    mutationFn: async (input) => {
      try {
        return await onboardDevice(input);
      } catch (error) {
        throw mapToOnboardDeviceError(error);
      }
    },
    onSuccess: (data, variables, context, meta) => {
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      options?.onSuccess?.(data, variables, context, meta);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
    onMutate: options?.onMutate,
  });
};
