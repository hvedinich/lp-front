import { apiRequest } from '@/shared/api';
import type { HostedPageDTO } from './dto';

export const getHostedPageByLocation = async (locationId: string): Promise<HostedPageDTO> => {
  return apiRequest<HostedPageDTO>({
    method: 'GET',
    path: `/hosted-pages/${locationId}`,
  });
};
