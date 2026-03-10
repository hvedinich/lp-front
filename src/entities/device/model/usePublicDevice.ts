import { useQuery } from '@tanstack/react-query';
import { getPublicDevice } from '../api/getPublicDevice';
import { deviceQueryKeys } from './queryKeys';
import type { Device } from './types';

export const usePublicDevice = (shortCode: string | undefined) =>
  useQuery<Device | null>({
    queryKey: deviceQueryKeys.public(shortCode ?? ''),
    queryFn: async () => {
      if (!shortCode) {
        return null;
      }

      const device = await getPublicDevice(shortCode);
      return device;
    },
    enabled: !!shortCode,
    retry: false,
  });
