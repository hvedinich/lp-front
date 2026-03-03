import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLocation } from '../api/deleteLocation';
import { toLocationError, type LocationError } from './errors';
import { invalidateLocations } from './invalidateLocations';
import type { MutationCallbacks } from '@/shared/lib';

export const useDeleteLocation = (
  accountId: string,
  options?: MutationCallbacks<void, string, LocationError>,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, LocationError, string>({
    mutationFn: async (locationId) => {
      try {
        await deleteLocation(locationId);
      } catch (error) {
        throw toLocationError(error);
      }
    },
    onError: options?.onError,
    onMutate: options?.onMutate,
    onSettled: options?.onSettled,
    onSuccess: (data, variables, context, mutation) => {
      void invalidateLocations(queryClient, accountId);
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
