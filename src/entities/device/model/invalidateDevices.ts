import type { QueryClient } from '@tanstack/react-query';
import { deviceQueryKeys } from './queryKeys';

const getUniqueLocationIds = (locationIds?: Array<string | null | undefined>) => {
  return Array.from(
    new Set((locationIds ?? []).filter((locationId): locationId is string => Boolean(locationId))),
  );
};

export const invalidateDevices = async (
  queryClient: QueryClient,
  accountId: string,
  locationIds?: Array<string | null | undefined>,
): Promise<void> => {
  const uniqueLocationIds = getUniqueLocationIds(locationIds);

  if (uniqueLocationIds.length === 0) {
    await queryClient.invalidateQueries({ queryKey: deviceQueryKeys.lists(accountId) });
    return;
  }

  await Promise.all(
    uniqueLocationIds.map((locationId) =>
      queryClient.invalidateQueries({
        queryKey: deviceQueryKeys.list(accountId, {
          filters: {
            locationId,
          },
        }),
      }),
    ),
  );
};
