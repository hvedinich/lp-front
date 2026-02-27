import type { AuthSession, AuthSessionPayload } from '../model/types';
import { apiRequest, isApiError } from '@/shared/api';

export const getAuthSessionState = async (): Promise<AuthSession> => {
  try {
    const payload = await apiRequest<AuthSessionPayload>({
      method: 'GET',
      cache: 'no-store',
      path: '/auth/me',
    });

    return {
      payload,
      state: 'authenticated',
    };
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return {
        payload: null,
        state: 'unauthenticated',
      };
    }

    return {
      payload: null,
      state: 'unknown',
    };
  }
};
