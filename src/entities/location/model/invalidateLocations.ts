import type { QueryClient } from '@tanstack/react-query';
import { locationQueryKeys } from './queryKeys';

export const invalidateLocations = async (
  queryClient: QueryClient,
  accountId: string,
  locationId?: string,
): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: locationQueryKeys.lists(accountId) });

  if (locationId) {
    await queryClient.invalidateQueries({
      queryKey: locationQueryKeys.item(accountId, locationId),
    });
  }
};
