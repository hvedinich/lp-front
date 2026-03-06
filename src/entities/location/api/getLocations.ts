import type { GetLocationsParams, LocationDto } from './location.dto';
import { apiRequest } from '@/shared/api';
import { buildListQueryString } from '@/shared/lib';

export const getLocations = async (params: GetLocationsParams = {}): Promise<LocationDto[]> => {
  return apiRequest<LocationDto[]>({
    method: 'GET',
    path: `/locations${buildListQueryString(params)}`,
  });
};
