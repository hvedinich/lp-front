import { useMutation, useQueryClient } from '@tanstack/react-query';
import { configureDevice } from '../api/configureDevice';
import type { DeviceLifecycleDtoRequest } from '../api/device.dto';
import { mapDeviceDto } from '../lib/device.mapper';
import { mapToDeviceError, type DeviceError } from './errors';
import { invalidateDevices } from './invalidateDevices';
import { deviceQueryKeys } from './queryKeys';
import type { Device } from './types';
import type { MutationHookOptions } from '@/shared/lib';

export interface ConfigureDeviceVariables {
  id: string;
  input: DeviceLifecycleDtoRequest;
  previousLocationId?: string | null;
}

interface ConfigureDeviceScope {
  accountId: string;
}

export const useConfigureDevice = (
  options: MutationHookOptions<ConfigureDeviceScope, Device, ConfigureDeviceVariables, DeviceError>,
) => {
  const queryClient = useQueryClient();
  const { options: mutationOptions, scope } = options;

  return useMutation<Device, DeviceError, ConfigureDeviceVariables>({
    mutationFn: async ({ id, input }) => {
      try {
        const response = await configureDevice(id, input);
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
