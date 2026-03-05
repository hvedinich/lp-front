import { useTranslation } from 'react-i18next';
import {
  type Location,
  type LocationError,
  type UpdateLocationDtoRequest,
  useCreateLocation,
  useDeleteLocation,
  useUpdateLocation,
} from '@/entities/location';
import { toaster } from '@/shared/ui';
import { mapCreateLocationFormValues } from './locationForm';
import { resolveLocationToastMessage } from './locationErrorUi';
import type { LocationFormValues } from './locationSchema';

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
  const { t } = useTranslation('common');
  const handleError = useLocationErrorToaster();

  const createMutation = useCreateLocation({
    scope: { accountId },
    options: {
      onError: handleError,
      onSuccess: () => {
        toaster.success({ description: t('commonFeedback.created') });
      },
    },
  });

  const updateMutation = useUpdateLocation({
    scope: { accountId },
    options: {
      onError: handleError,
      onSuccess: () => {
        toaster.success({ description: t('commonFeedback.saved') });
      },
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
    deleteLocation: (locationId) => deleteMutation.mutateAsync(locationId),
  };
};
