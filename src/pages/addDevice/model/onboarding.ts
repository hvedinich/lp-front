import { apiRequest } from '@/shared/api';
import type {
  DeviceOnboardingResponse,
  OnboardPayload,
  OnboardLocationPayload,
  OnboardLocationResponse,
} from './types';

export const onboardDevice = async (payload: OnboardPayload): Promise<DeviceOnboardingResponse> => {
  return apiRequest<DeviceOnboardingResponse, OnboardPayload>({
    body: payload,
    method: 'POST',
    path: '/onboarding',
    skipAuthRefresh: true,
  });
};

export const createOnboardingLocation = async (
  payload: OnboardLocationPayload,
): Promise<OnboardLocationResponse> => {
  return apiRequest<OnboardLocationResponse, OnboardLocationPayload>({
    body: payload,
    method: 'POST',
    path: '/onboarding/locations',
  });
};
