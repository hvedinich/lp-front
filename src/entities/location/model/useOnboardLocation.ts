import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationQueryKeys } from '@/entities/location';
import type { MutationHookOptions } from '@/shared/lib';
import { LocationError, mapToLocationError } from './errors';
import { onboardLocation } from '../api/onboardLocation';
import { OnboardLocationPayload, OnboardLocationResponse } from '../api/location.dto';

interface OnboardLocationScope {
  accountId: string;
}

export const useOnboardLocation = (
  params: MutationHookOptions<
    OnboardLocationScope,
    OnboardLocationResponse,
    OnboardLocationPayload,
    LocationError
  >,
) => {
  const queryClient = useQueryClient();
  const { options, scope } = params;

  return useMutation<OnboardLocationResponse, LocationError, OnboardLocationPayload>({
    mutationFn: async (input) => {
      try {
        return await onboardLocation(input);
      } catch (error) {
        throw mapToLocationError(error);
      }
    },
    onSuccess: (data, variables, context, meta) => {
      void queryClient.invalidateQueries({ queryKey: locationQueryKeys.lists(scope.accountId) });
      void queryClient.invalidateQueries({
        queryKey: locationQueryKeys.item(scope.accountId, data.location.id),
      });
      options?.onSuccess?.(data, variables, context, meta);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
    onMutate: options?.onMutate,
  });
};
