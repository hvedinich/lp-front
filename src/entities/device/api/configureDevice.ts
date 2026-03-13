import type { DeviceLifecycleDtoRequest, DeviceDto } from './device.dto';
import { apiRequest } from '@/shared/api';

export const configureDevice = async (
  id: string,
  input: DeviceLifecycleDtoRequest,
): Promise<DeviceDto> => {
  return apiRequest<DeviceDto, DeviceLifecycleDtoRequest>({
    body: input,
    method: 'PATCH',
    path: `/devices/${id}/configure`,
  });
};
