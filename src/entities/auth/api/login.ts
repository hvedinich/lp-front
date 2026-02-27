import type { LoginPayload, LoginResponse } from '../model/types';
import { apiRequest } from '@/shared/api';

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  return apiRequest<LoginResponse, LoginPayload>({
    body: payload,
    method: 'POST',
    path: '/auth/login',
    skipAuthRefresh: true,
  });
};
