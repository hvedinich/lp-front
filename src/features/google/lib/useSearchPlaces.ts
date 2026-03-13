import { useMutation } from '@tanstack/react-query';
import type { MutationHookOptions } from '@/shared/lib';
import { searchPlaces } from './google-places.api';
import type { PlaceSuggestion } from './google-places.types';

interface SearchPlacesScope {
  region: string;
}

interface SearchPlacesVariables {
  input: string;
  sessionToken?: string;
}

export const useSearchPlaces = (
  params: MutationHookOptions<SearchPlacesScope, PlaceSuggestion[], SearchPlacesVariables>,
) => {
  const { scope, options } = params;

  return useMutation<PlaceSuggestion[], Error, SearchPlacesVariables>({
    mutationFn: ({ input, sessionToken }) =>
      searchPlaces({ input, sessionToken, region: scope.region }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: options?.onSettled,
    onMutate: options?.onMutate,
  });
};
