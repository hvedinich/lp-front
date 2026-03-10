import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLocation } from '../api/updateLocation';
import type { UpdateLocationDtoRequest } from '../api/location.dto';
import { mapLocationDto } from '../lib/location.mapper';
import { mapToLocationError, type LocationError } from './errors';
import { invalidateLocations } from './invalidateLocations';
import { locationQueryKeys } from './queryKeys';
import type { Location } from './types';
import type { MutationHookOptions } from '@/shared/lib';

export interface UpdateLocationVariables {
  id: string;
  input: UpdateLocationDtoRequest;
}

interface UpdateLocationScope {
  accountId: string;
}

export const useUpdateLocation = (
  options: MutationHookOptions<
    UpdateLocationScope,
    Location,
    UpdateLocationVariables,
    LocationError
  >,
) => {
  const queryClient = useQueryClient();
  const { options: mutationOptions, scope } = options;

  return useMutation<Location, LocationError, UpdateLocationVariables>({
    mutationFn: async ({ id, input }) => {
      try {
        const response = await updateLocation(id, input);
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
