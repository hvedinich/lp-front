import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLocation } from '../api/updateLocation';
import type { UpdateLocationDtoRequest } from '../api/location.dto';
import { mapLocationDto } from '../lib/location.mapper';
import { toLocationError, type LocationError } from './errors';
import { invalidateLocations } from './invalidateLocations';
import type { Location } from './types';
import type { MutationCallbacks } from '@/shared/lib';

export interface UpdateLocationVariables {
  id: string;
  input: UpdateLocationDtoRequest;
}

export const useUpdateLocation = (
  accountId: string,
  options?: MutationCallbacks<Location, UpdateLocationVariables, LocationError>,
) => {
  const queryClient = useQueryClient();

  return useMutation<Location, LocationError, UpdateLocationVariables>({
    mutationFn: async ({ id, input }) => {
      try {
        const response = await updateLocation(id, input);
        return mapLocationDto(response);
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
