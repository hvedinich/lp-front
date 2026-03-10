import { useQuery } from '@tanstack/react-query';
import { getLocations } from '../api/getLocations';
import type { GetLocationsParams } from '../api/location.dto';
import { mapLocationDto } from '../lib/location.mapper';
import { mapToLocationError, type LocationError } from './errors';
import { locationQueryKeys } from './queryKeys';
import type { Location } from './types';
import type { QueryHookOptions } from '@/shared/lib';

type UseLocationsScope = {
  accountId: string | null | undefined;
  params?: GetLocationsParams;
};

export const useLocations = ({
  scope,
  options,
}: QueryHookOptions<UseLocationsScope, Location[], LocationError, Location[]>) => {
  const { accountId, params } = scope;

  const isEnabledByAccount = Boolean(accountId);
  const isEnabled = options?.enabled ?? true;

  return useQuery<Location[], LocationError>({
    gcTime: 1_800_000,
    queryFn: async () => {
      try {
        const response = await getLocations(params);
        return response.map(mapLocationDto);
      } catch (error) {
        throw mapToLocationError(error);
      }
    },
    queryKey: locationQueryKeys.list(accountId ?? '__unknown-account__', params),
    staleTime: 300_000,
    ...options,
    enabled: isEnabledByAccount && isEnabled,
  });
};
