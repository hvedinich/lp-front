import { useTranslation } from 'react-i18next';
import { toaster } from '@/shared/ui';
import type { Location, LocationFormValues } from './types';
import { UpdateLocationDtoRequest } from '../api/location.dto';
import { LocationError } from './errors';
import { resolveLocationToastMessage } from './locationErrorUi';
import { useCreateLocation } from './useCreateLocation';
import { useUpdateLocation } from './useUpdateLocation';
import { useDeleteLocation } from './useDeleteLocation';
import { mapCreateLocationFormValues } from '../lib/location.mapper';

interface UseLocationActionsOptions {
  accountId: string;
}

interface UseLocationActionsResult {
  isCreatePending: boolean;
  isDeletePending: boolean;
  isUpdatePending: boolean;
  createLocation: (values: LocationFormValues) => Promise<Location>;
  updateLocation: (locationId: string, input: UpdateLocationDtoRequest) => Promise<Location>;
  deleteLocation: (locationId: string) => Promise<void>;
}

const useLocationErrorToaster = () => {
  const { t } = useTranslation('common');

  return (error: LocationError) => {
    const message = resolveLocationToastMessage({ error, t });
    if (message) {
      toaster.error({ description: message });
    }
  };
};

export const useLocationActions = ({
  accountId,
}: UseLocationActionsOptions): UseLocationActionsResult => {
  const handleError = useLocationErrorToaster();

  const createMutation = useCreateLocation({
    scope: { accountId },
    options: {
      onError: handleError,
    },
  });

  const updateMutation = useUpdateLocation({
    scope: { accountId },
    options: {
      onError: handleError,
    },
  });

  const deleteMutation = useDeleteLocation({
    scope: { accountId },
    options: {
      onError: handleError,
    },
  });

  return {
    isCreatePending: createMutation.isPending,
    isDeletePending: deleteMutation.isPending,
    isUpdatePending: updateMutation.isPending,
    createLocation: (values) => createMutation.mutateAsync(mapCreateLocationFormValues(values)),
    updateLocation: (locationId, input) =>
      updateMutation.mutateAsync({
        id: locationId,
        input,
      }),
    deleteLocation: async (locationId) => {
      try {
        await deleteMutation.mutateAsync(locationId);
      } catch {
        // Error UI is handled by the mutation onError callback.
      }
    },
  };
};
