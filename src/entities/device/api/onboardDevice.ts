import { apiRequest } from '@/shared/api';
import { OnboardDevicePayload } from '../model/types';
import { DeviceOnboardingResponse } from './device.dto';

export const onboardDevice = async (
  payload: OnboardDevicePayload,
): Promise<DeviceOnboardingResponse> => {
  return apiRequest<DeviceOnboardingResponse, OnboardDevicePayload>({
    body: payload,
    method: 'POST',
    path: '/onboarding',
    skipAuthRefresh: true,
  });
};
