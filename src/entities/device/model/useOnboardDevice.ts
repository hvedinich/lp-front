import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MutationHookOptions } from '@/shared/lib';
import { authQueryKeys } from '@/entities/contracts';
import { OnboardDevicePayload } from './types';
import { onboardDevice } from '../api/onboardDevice';
import { DeviceError, mapToDeviceError } from './errors';
import { DeviceOnboardingResponse } from '../api/device.dto';

export const useOnboardDevice = (
  params: MutationHookOptions<
    Record<string, never>,
    DeviceOnboardingResponse,
    OnboardDevicePayload,
    DeviceError
  > = { scope: {} },
) => {
  const queryClient = useQueryClient();
  const { options, scope } = params;
  void scope;

  return useMutation<DeviceOnboardingResponse, DeviceError, OnboardDevicePayload>({
    mutationFn: async (input) => {
      try {
        return await onboardDevice(input);
      } catch (error) {
        throw mapToDeviceError(error);
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
