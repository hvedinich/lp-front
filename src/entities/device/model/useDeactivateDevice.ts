import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateDevice } from '../api/deactivateDevice';
import { mapDeviceDto } from '../lib/device.mapper';
import { mapToDeviceError, type DeviceError } from './errors';
import { invalidateDevices } from './invalidateDevices';
import { deviceQueryKeys } from './queryKeys';
import type { Device } from './types';
import type { MutationHookOptions } from '@/shared/lib';

export interface DeactivateDeviceVariables {
  id: string;
  previousLocationId?: string | null;
}

interface DeactivateDeviceScope {
  accountId: string;
}

export const useDeactivateDevice = (
  options: MutationHookOptions<
    DeactivateDeviceScope,
    Device,
    DeactivateDeviceVariables,
    DeviceError
  >,
) => {
  const queryClient = useQueryClient();
  const { options: mutationOptions, scope } = options;

  return useMutation<Device, DeviceError, DeactivateDeviceVariables>({
    mutationFn: async ({ id }) => {
      try {
        const response = await deactivateDevice(id);
        return mapDeviceDto(response);
      } catch (error) {
        throw mapToDeviceError(error);
      }
    },
    onError: mutationOptions?.onError,
    onMutate: mutationOptions?.onMutate,
    onSettled: mutationOptions?.onSettled,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.setQueryData(deviceQueryKeys.item(scope.accountId, data.id), data);
      void invalidateDevices(queryClient, scope.accountId, [
        variables.previousLocationId,
        data.locationId,
      ]);
      mutationOptions?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
