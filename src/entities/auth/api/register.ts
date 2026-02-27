import type { RegisterPayload, RegisterResponse } from '../model/types';
import { apiRequest } from '@/shared/api';

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  return apiRequest<RegisterResponse, RegisterPayload>({
    body: payload,
    method: 'POST',
    path: '/auth/register',
    skipAuthRefresh: true,
  });
};
