import { apiRequest } from '@/shared/api';
import { OnboardLocationPayload, OnboardLocationResponse } from './location.dto';

export const onboardLocation = async (
  payload: OnboardLocationPayload,
): Promise<OnboardLocationResponse> => {
  return apiRequest<OnboardLocationResponse, OnboardLocationPayload>({
    body: payload,
    method: 'POST',
    path: '/onboarding/locations',
  });
};
