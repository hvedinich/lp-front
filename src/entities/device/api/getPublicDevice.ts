import { apiRequest } from '@/shared/api';
import type { Device } from '../model/types';

export const getPublicDevice = async (shortCode: string): Promise<Device | null> => {
  return apiRequest<Device>({
    method: 'GET',
    path: `/devices/public/${shortCode}`,
  });
};
