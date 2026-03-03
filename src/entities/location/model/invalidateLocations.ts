import type { QueryClient } from '@tanstack/react-query';
import { locationQueryKeys } from './queryKeys';

export const invalidateLocations = async (
  queryClient: QueryClient,
  accountId: string,
): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: locationQueryKeys.account(accountId) });
};
