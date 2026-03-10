import type { ActivateDeviceDtoRequest, DeviceDto } from './device.dto';
import { apiRequest } from '@/shared/api';

export const activateDevice = async (
  id: string,
  input: ActivateDeviceDtoRequest,
): Promise<DeviceDto> => {
  return apiRequest<DeviceDto, ActivateDeviceDtoRequest>({
    body: input,
    method: 'PATCH',
    path: `/devices/${id}/activate`,
  });
};
