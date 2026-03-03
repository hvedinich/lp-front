import type { GetLocationsParams, LocationDto } from './location.dto';
import { apiRequest } from '@/shared/api';

const toSearchParams = (params: GetLocationsParams): string => {
  const searchParams = new URLSearchParams();

  if (params.name) {
    searchParams.set('name', params.name);
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (typeof params.offset === 'number') {
    searchParams.set('offset', String(params.offset));
  }

  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : '';
};

export const getLocations = async (params: GetLocationsParams = {}): Promise<LocationDto[]> => {
  return apiRequest<LocationDto[]>({
    method: 'GET',
    path: `/locations${toSearchParams(params)}`,
  });
};
