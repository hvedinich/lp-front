import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLocation } from '../api/createLocation';
import type { CreateLocationDtoRequest } from '../api/location.dto';
import { mapLocationDto } from '../lib/location.mapper';
import { toLocationError, type LocationError } from './errors';
import { invalidateLocations } from './invalidateLocations';
import type { Location } from './types';
import type { MutationCallbacks } from '@/shared/lib';

export const useCreateLocation = (
  accountId: string,
  options?: MutationCallbacks<Location, CreateLocationDtoRequest, LocationError>,
) => {
  const queryClient = useQueryClient();

  return useMutation<Location, LocationError, CreateLocationDtoRequest>({
    mutationFn: async (input) => {
      try {
        const response = await createLocation(input);
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
