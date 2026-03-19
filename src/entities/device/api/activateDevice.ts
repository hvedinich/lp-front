import { apiRequest } from '@/shared/api';
import { ActivateMultiDevicePayload, ActivateSingleDevicePayload } from '../model/types';
import { DeviceDto } from './device.dto';
import { ActivateDeviceVariables } from '../model/useActivateDevice';

export const activateDevice = async ({
  id,
  input,
}: ActivateDeviceVariables): Promise<DeviceDto> => {
  return apiRequest<DeviceDto, ActivateMultiDevicePayload | ActivateSingleDevicePayload>({
    body: input,
    method: 'PATCH',
    path: `/devices/${id}/activate`,
  });
};
