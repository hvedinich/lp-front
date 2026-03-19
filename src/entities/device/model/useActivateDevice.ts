import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activateDevice } from '../api/activateDevice';
import { mapDeviceDto } from '../lib/device.mapper';
import { mapToDeviceError, type DeviceError } from './errors';
import { invalidateDevices } from './invalidateDevices';
import { deviceQueryKeys } from './queryKeys';
import type { ActivateMultiDevicePayload, ActivateSingleDevicePayload, Device } from './types';
import type { MutationHookOptions } from '@/shared/lib';

export interface ActivateDeviceVariables {
  id: string;
  input: ActivateMultiDevicePayload | ActivateSingleDevicePayload;
  previousLocationId?: string | null;
}

interface ActivateDeviceScope {
  accountId: string;
}

export const useActivateDevice = (
  options: MutationHookOptions<ActivateDeviceScope, Device, ActivateDeviceVariables, DeviceError>,
) => {
  const queryClient = useQueryClient();
  const { options: mutationOptions, scope } = options;

  return useMutation<Device, DeviceError, ActivateDeviceVariables>({
    mutationFn: async ({ id, input }) => {
      try {
        const response = await activateDevice({ id, input });
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
