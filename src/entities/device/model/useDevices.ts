import { useQuery } from '@tanstack/react-query';
import { getDevices } from '../api/getDevices';
import { mapDeviceDto } from '../lib/device.mapper';
import { mapToDeviceError, type DeviceError } from './errors';
import { deviceQueryKeys } from './queryKeys';
import type { Device } from './types';
import type { QueryHookOptions } from '@/shared/lib';

type UseDevicesScope = {
  accountId: string | null | undefined;
  locationId: string | null | undefined;
};

export const useDevices = ({
  scope,
  options,
}: QueryHookOptions<UseDevicesScope, Device[], DeviceError, Device[]>) => {
  const { accountId, locationId } = scope;

  const isEnabledByScope = Boolean(accountId && locationId);
  const isEnabled = options?.enabled ?? true;

  return useQuery<Device[], DeviceError>({
    gcTime: 1_800_000,
    queryFn: async () => {
      try {
        const response = await getDevices({
          filters: {
            locationId: locationId!,
          },
        });

        return response.map(mapDeviceDto);
      } catch (error) {
        throw mapToDeviceError(error);
      }
    },
    queryKey: deviceQueryKeys.list(accountId ?? '__unknown-account__', {
      filters: {
        locationId: locationId ?? undefined,
      },
    }),
    staleTime: 300_000,
    ...options,
    enabled: isEnabledByScope && isEnabled,
  });
};
