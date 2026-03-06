import type { DeviceDto } from './device.dto';
import { apiRequest } from '@/shared/api';

export const deactivateDevice = async (id: string): Promise<DeviceDto> => {
  return apiRequest<DeviceDto>({
    method: 'PATCH',
    path: `/devices/${id}/deactivate`,
  });
};
