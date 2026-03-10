import { apiRequest } from '@/shared/api';
import { devicePaths } from './constants';
import type { Device } from '../model/types';

export const getPublicDevice = async (shortCode: string): Promise<Device | null> => {
  return apiRequest<Device>({
    method: 'GET',
    path: devicePaths.public(shortCode),
  });
};
