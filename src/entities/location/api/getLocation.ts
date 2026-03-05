import type { LocationDto } from './location.dto';
import { apiRequest } from '@/shared/api';

export const getLocation = async (id: string): Promise<LocationDto> => {
  return apiRequest<LocationDto>({
    method: 'GET',
    path: `/locations/${id}`,
  });
};
