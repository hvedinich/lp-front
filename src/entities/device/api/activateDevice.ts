import { apiRequest } from '@/shared/api';
import {
  ActivateDevicePayload,
  ActivateMultiDevicePayload,
  ActivateSingleDevicePayload,
  Device,
} from '../model/types';
import { devicePaths } from './constants';

export const activateDevice = async ({ id, payload }: ActivateDevicePayload): Promise<Device> => {
  return apiRequest<Device, ActivateMultiDevicePayload | ActivateSingleDevicePayload>({
    body: payload,
    method: 'PATCH',
    path: devicePaths.activate(id),
    skipAuthRefresh: true,
  });
};
