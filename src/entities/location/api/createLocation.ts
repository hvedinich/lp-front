import type { CreateLocationDtoRequest, LocationDto } from './location.dto';
import { apiRequest } from '@/shared/api';

export const createLocation = async (input: CreateLocationDtoRequest): Promise<LocationDto> => {
  return apiRequest<LocationDto, CreateLocationDtoRequest>({
    body: input,
    method: 'POST',
    path: '/locations',
  });
};
