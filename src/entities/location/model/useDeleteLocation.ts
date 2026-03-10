import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLocation } from '../api/deleteLocation';
import { mapToLocationError, type LocationError } from './errors';
import { invalidateLocations } from './invalidateLocations';
import { locationQueryKeys } from './queryKeys';
import type { MutationHookOptions } from '@/shared/lib';

interface DeleteLocationScope {
  accountId: string;
}

export const useDeleteLocation = (
  options: MutationHookOptions<DeleteLocationScope, void, string, LocationError>,
) => {
  const queryClient = useQueryClient();
  const { options: mutationOptions, scope } = options;

  return useMutation<void, LocationError, string>({
    mutationFn: async (locationId) => {
      try {
        await deleteLocation(locationId);
      } catch (error) {
        throw mapToLocationError(error);
      }
    },
    onError: mutationOptions?.onError,
    onMutate: mutationOptions?.onMutate,
    onSettled: mutationOptions?.onSettled,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.removeQueries({
        queryKey: locationQueryKeys.item(scope.accountId, variables),
      });
      void invalidateLocations(queryClient, scope.accountId);
      mutationOptions?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
