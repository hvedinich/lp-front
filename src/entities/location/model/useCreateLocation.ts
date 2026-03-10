import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLocation } from '../api/createLocation';
import type { CreateLocationDtoRequest } from '../api/location.dto';
import { mapLocationDto } from '../lib/location.mapper';
import { mapToLocationError, type LocationError } from './errors';
import { invalidateLocations } from './invalidateLocations';
import { locationQueryKeys } from './queryKeys';
import type { Location } from './types';
import type { MutationHookOptions } from '@/shared/lib';

interface CreateLocationScope {
  accountId: string;
}

export const useCreateLocation = (
  options: MutationHookOptions<
    CreateLocationScope,
    Location,
    CreateLocationDtoRequest,
    LocationError
  >,
) => {
  const queryClient = useQueryClient();
  const { options: mutationOptions, scope } = options;

  return useMutation<Location, LocationError, CreateLocationDtoRequest>({
    mutationFn: async (input) => {
      try {
        const response = await createLocation(input);
        return mapLocationDto(response);
      } catch (error) {
        throw mapToLocationError(error);
      }
    },
    onError: mutationOptions?.onError,
    onMutate: mutationOptions?.onMutate,
    onSettled: mutationOptions?.onSettled,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.setQueryData(locationQueryKeys.item(scope.accountId, data.id), data);
      void invalidateLocations(queryClient, scope.accountId, data.id);
      mutationOptions?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
