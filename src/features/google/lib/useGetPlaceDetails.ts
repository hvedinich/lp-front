import { useMutation } from '@tanstack/react-query';
import type { MutationHookOptions } from '@/shared/lib';
import { getPlaceDetails } from './google-places.api';
import type { PlaceDetails } from './google-places.types';
import { mapToPlaceError, type PlaceError } from './errors';

interface GetPlaceDetailsVariables {
  placeId: string;
  sessionToken?: string;
}

export const useGetPlaceDetails = (
  params: MutationHookOptions<
    Record<string, never>,
    PlaceDetails | null,
    GetPlaceDetailsVariables,
    PlaceError
  > = { scope: {} },
) => {
  const { options, scope } = params;
  void scope;

  return useMutation<PlaceDetails | null, PlaceError, GetPlaceDetailsVariables>({
    mutationFn: async ({ placeId, sessionToken }) => {
      try {
        return await getPlaceDetails(placeId, sessionToken);
      } catch (error) {
        throw mapToPlaceError(error);
      }
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: options?.onSettled,
    onMutate: options?.onMutate,
  });
};
