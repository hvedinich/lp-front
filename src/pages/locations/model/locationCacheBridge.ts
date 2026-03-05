import type { QueryClient } from '@tanstack/react-query';
import { type Location, locationQueryKeys } from '@/entities/location';

export const getLocationFromListCache = (
  queryClient: QueryClient,
  accountId: string,
  locationId: string,
): Location | undefined => {
  const cachedLists = queryClient.getQueriesData<Location[]>({
    queryKey: locationQueryKeys.lists(accountId),
  });

  for (const [, list] of cachedLists) {
    const fromList = list?.find((item) => item.id === locationId);
    if (fromList) {
      return fromList;
    }
  }

  return undefined;
};
