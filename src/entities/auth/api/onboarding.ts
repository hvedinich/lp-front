import { apiRequest } from '@/shared/api';
import type { DeviceOnboardingResponse, OnboardPayload } from '../model/types';

export const onboardDevice = async (payload: OnboardPayload): Promise<DeviceOnboardingResponse> => {
  return apiRequest<DeviceOnboardingResponse, OnboardPayload>({
    body: payload,
    method: 'POST',
    path: '/onboarding',
    skipAuthRefresh: true,
  });
};
