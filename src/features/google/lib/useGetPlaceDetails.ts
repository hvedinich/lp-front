import { useMutation } from '@tanstack/react-query';
import type { MutationHookOptions } from '@/shared/lib';
import { getPlaceDetails } from './google-places.api';
import type { PlaceDetails } from './google-places.types';

interface GetPlaceDetailsVariables {
  placeId: string;
  sessionToken?: string;
}

export const useGetPlaceDetails = (
  params: MutationHookOptions<
    Record<string, never>,
    PlaceDetails | null,
    GetPlaceDetailsVariables
  > = { scope: {} },
) => {
  const { options, scope } = params;
  void scope;

  return useMutation<PlaceDetails | null, Error, GetPlaceDetailsVariables>({
    mutationFn: ({ placeId, sessionToken }) => getPlaceDetails(placeId, sessionToken),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: options?.onSettled,
    onMutate: options?.onMutate,
  });
};
