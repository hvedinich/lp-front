import type { HostedPageDTO } from '@/entities/contracts';
import { apiRequest } from '@/shared/api';

export const getHostedPageByLocation = async (locationId: string): Promise<HostedPageDTO> => {
  return apiRequest<HostedPageDTO>({
    method: 'GET',
    path: `/hosted-pages/${locationId}`,
  });
};
