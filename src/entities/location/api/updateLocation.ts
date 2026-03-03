import type { LocationDto, UpdateLocationDtoRequest } from './location.dto';
import { apiRequest } from '@/shared/api';

export const updateLocation = async (
  id: string,
  input: UpdateLocationDtoRequest,
): Promise<LocationDto> => {
  return apiRequest<LocationDto, UpdateLocationDtoRequest>({
    body: input,
    method: 'PATCH',
    path: `/locations/${id}`,
  });
};
