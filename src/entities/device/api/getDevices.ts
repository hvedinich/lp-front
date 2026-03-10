import type { DeviceDto, GetDevicesParams } from './device.dto';
import { apiRequest } from '@/shared/api';
import { buildListQueryString } from '@/shared/lib';

export const getDevices = async (params: GetDevicesParams = {}): Promise<DeviceDto[]> => {
  return apiRequest<DeviceDto[]>({
    method: 'GET',
    path: `/devices${buildListQueryString(params)}`,
  });
};
