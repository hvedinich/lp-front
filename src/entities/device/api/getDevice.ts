import type { DeviceDto } from './device.dto';
import { apiRequest } from '@/shared/api';

export const getDevice = async (id: string): Promise<DeviceDto> => {
  return apiRequest<DeviceDto>({
    method: 'GET',
    path: `/devices/${id}`,
  });
};
