import { useQuery } from '@tanstack/react-query';
import { getHostedPageByLocation } from '../api/api';
import { mapHostedPageDTO } from '../lib/mapper';
import { hostedPageQueryKeys } from './queryKeys';
import type { HostedPage } from './types';
import type { QueryHookOptions } from '@/shared/lib';

type UseHostedPageScope = {
  locationId?: string | null;
};

export const useHostedPage = ({
  scope,
  options,
}: QueryHookOptions<UseHostedPageScope, HostedPage>) => {
  const { locationId } = scope;

  const isEnabledByScope = Boolean(locationId);
  const isEnabled = options?.enabled ?? true;

  return useQuery<HostedPage>({
    queryKey: hostedPageQueryKeys.byLocation(locationId ?? ''),
    queryFn: async () => {
      const dto = await getHostedPageByLocation(locationId!);
      return mapHostedPageDTO(dto);
    },
    retry: false,
    ...options,
    enabled: isEnabledByScope && isEnabled,
  });
};
