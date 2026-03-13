import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationQueryKeys } from '@/entities/location';
import type { MutationHookOptions } from '@/shared/lib';
import { mapToOnboardDeviceError, type OnboardDeviceError } from './errors';
import { createOnboardingLocation } from './onboarding';
import type { OnboardLocationResponse, OnboardLocationPayload } from './types';

interface OnboardLocationScope {
  accountId: string;
}

export const useOnboardLocation = (
  params: MutationHookOptions<
    OnboardLocationScope,
    OnboardLocationResponse,
    OnboardLocationPayload,
    OnboardDeviceError
  >,
) => {
  const queryClient = useQueryClient();
  const { options, scope } = params;

  return useMutation<OnboardLocationResponse, OnboardDeviceError, OnboardLocationPayload>({
    mutationFn: async (input) => {
      try {
        return await createOnboardingLocation(input);
      } catch (error) {
        throw mapToOnboardDeviceError(error);
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
