import { apiRequest } from '@/shared/api';

export const logoutUser = async (): Promise<void> => {
  return apiRequest<void>({
    method: 'POST',
    parseAs: 'void',
    path: '/auth/logout',
  });
};
