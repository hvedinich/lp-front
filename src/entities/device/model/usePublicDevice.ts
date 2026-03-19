import { useQuery } from '@tanstack/react-query';
import { getPublicDevice } from '../api/getPublicDevice';
import { deviceQueryKeys } from './queryKeys';
import type { Device } from './types';
import type { QueryHookOptions } from '@/shared/lib';

type UsePublicDeviceScope = {
  shortCode?: string;
};

export const usePublicDevice = ({
  scope,
  options,
}: QueryHookOptions<UsePublicDeviceScope, Device | null>) => {
  const { shortCode } = scope;

  const isEnabledByScope = Boolean(shortCode);
  const isEnabled = options?.enabled ?? true;

  return useQuery<Device | null>({
    queryKey: deviceQueryKeys.public(shortCode ?? ''),
    queryFn: async () => {
      if (!shortCode) return null;
      return getPublicDevice(shortCode);
    },
    retry: false,
    ...options,
    enabled: isEnabledByScope && isEnabled,
  });
};
