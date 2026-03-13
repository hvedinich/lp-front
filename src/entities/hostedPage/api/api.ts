import { apiRequest } from '@/shared/api';
import { hostedPagePaths } from './constants';
import type { HostedPageDTO } from './dto';

export const getHostedPageByLocation = async (locationId: string): Promise<HostedPageDTO> => {
  return apiRequest<HostedPageDTO>({
    method: 'GET',
    path: hostedPagePaths.byLocation(locationId),
  });
};
