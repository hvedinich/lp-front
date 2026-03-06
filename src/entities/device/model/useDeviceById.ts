import { useQuery } from '@tanstack/react-query';
import { getDevice } from '../api/getDevice';
import { mapDeviceDto } from '../lib/device.mapper';
import { mapToDeviceError, type DeviceError } from './errors';
import { deviceQueryKeys } from './queryKeys';
import type { Device } from './types';
import type { QueryHookOptions } from '@/shared/lib';

type UseDeviceByIdScope = {
  accountId: string | null | undefined;
  id: string | null | undefined;
};

export const useDeviceById = ({
  scope,
  options,
}: QueryHookOptions<UseDeviceByIdScope, Device, DeviceError, Device>) => {
  const { accountId, id } = scope;

  const isEnabledByScope = Boolean(accountId && id);
  const isEnabled = options?.enabled ?? true;

  return useQuery<Device, DeviceError>({
    gcTime: 1_800_000,
    queryFn: async () => {
      try {
        const response = await getDevice(id!);
        return mapDeviceDto(response);
      } catch (error) {
        throw mapToDeviceError(error);
      }
    },
    queryKey: deviceQueryKeys.item(accountId ?? '__unknown-account__', id ?? '__unknown-id__'),
    staleTime: 300_000,
    ...options,
    enabled: isEnabledByScope && isEnabled,
  });
};
