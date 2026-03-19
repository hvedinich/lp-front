import { useMutation } from '@tanstack/react-query';
import type { MutationHookOptions } from '@/shared/lib';
import { searchPlaces } from './google-places.api';
import type { PlaceSuggestion } from './google-places.types';
import { mapToPlaceError, type PlaceError } from './errors';

interface SearchPlacesScope {
  region: string;
}

interface SearchPlacesVariables {
  input: string;
  sessionToken?: string;
}

export const useSearchPlaces = (
  params: MutationHookOptions<
    SearchPlacesScope,
    PlaceSuggestion[],
    SearchPlacesVariables,
    PlaceError
  >,
) => {
  const { scope, options } = params;

  return useMutation<PlaceSuggestion[], PlaceError, SearchPlacesVariables>({
    mutationFn: async ({ input, sessionToken }) => {
      try {
        return await searchPlaces({ input, sessionToken, region: scope.region });
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
