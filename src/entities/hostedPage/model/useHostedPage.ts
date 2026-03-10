import { useQuery } from '@tanstack/react-query';
import { getHostedPageByLocation } from '../api/api';
import { mapHostedPageDTO } from '../lib/mapper';
import { hostedPageQueryKeys } from './queryKeys';
import type { HostedPage } from './types';

export const useHostedPage = (locationId?: string | null) =>
  useQuery<HostedPage>({
    queryKey: hostedPageQueryKeys.byLocation(locationId ?? ''),
    queryFn: async () => {
      const dto = await getHostedPageByLocation(locationId!);
      return mapHostedPageDTO(dto);
    },
    enabled: Boolean(locationId),
    retry: false,
  });
