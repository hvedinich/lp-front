import type { ConfigureDeviceDtoRequest, DeviceDto } from './device.dto';
import { apiRequest } from '@/shared/api';

export const configureDevice = async (
  id: string,
  input: ConfigureDeviceDtoRequest,
): Promise<DeviceDto> => {
  return apiRequest<DeviceDto, ConfigureDeviceDtoRequest>({
    body: input,
    method: 'PATCH',
    path: `/devices/${id}/configure`,
  });
};
