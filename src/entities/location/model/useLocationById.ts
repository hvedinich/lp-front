import { useQuery } from '@tanstack/react-query';
import { getLocation } from '../api/getLocation';
import { mapLocationDto } from '../lib/location.mapper';
import { mapToLocationError, type LocationError } from './errors';
import { locationQueryKeys } from './queryKeys';
import type { Location } from './types';
import type { QueryHookOptions } from '@/shared/lib';

type UseLocationByIdScope = {
  accountId: string | null | undefined;
  id: string | null | undefined;
};

export const useLocationById = ({
  scope,
  options,
}: QueryHookOptions<UseLocationByIdScope, Location, LocationError, Location>) => {
  const { accountId, id } = scope;

  const isEnabledByScope = Boolean(accountId && id);
  const isEnabled = options?.enabled ?? true;

  return useQuery<Location, LocationError>({
    gcTime: 1_800_000,
    queryFn: async () => {
      try {
        const response = await getLocation(id!);
        return mapLocationDto(response);
      } catch (error) {
        throw mapToLocationError(error);
      }
    },
    queryKey: locationQueryKeys.item(accountId ?? '__unknown-account__', id ?? '__unknown-id__'),
    staleTime: 300_000,
    ...options,
    enabled: isEnabledByScope && isEnabled,
  });
};
