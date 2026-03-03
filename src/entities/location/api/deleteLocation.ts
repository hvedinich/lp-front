import { apiRequest } from '@/shared/api';

export const deleteLocation = async (id: string): Promise<void> => {
  return apiRequest<void>({
    method: 'DELETE',
    parseAs: 'void',
    path: `/locations/${id}`,
  });
};
