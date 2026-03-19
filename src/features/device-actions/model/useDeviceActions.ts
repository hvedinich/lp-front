import { useTranslation } from 'react-i18next';
import { locationSelectionSelectors } from '@/entities/location';
import { useUiStore } from '@/shared/store';
import { toaster } from '@/shared/ui';
import {
  type ActivateMultiDevicePayload,
  type ActivateSingleDevicePayload,
  type Device,
  type DeviceError,
  useActivateDevice,
  useConfigureDevice,
  useDeactivateDevice,
} from '@/entities/device';
import { resolveDeviceToastMessage } from './deviceErrorUi';
import {
  type DeviceFormValues,
  mapConfigureDeviceFormValues,
} from './deviceForm';

interface UseDeviceActionsOptions {
  accountId: string;
}

interface DeviceActionTarget {
  deviceId: string;
  locationId?: string | null;
}

interface UseDeviceActionsResult {
  isActivatePending: boolean;
  isConfigurePending: boolean;
  isDeactivatePending: boolean;
  syncSelectedLocationId: (locationId: string | null | undefined) => string | null;
  activateDevice: (
    target: DeviceActionTarget,
    values: ActivateSingleDevicePayload | ActivateMultiDevicePayload,
  ) => Promise<Device>;
  configureDevice: (target: DeviceActionTarget, values: DeviceFormValues) => Promise<Device>;
  deactivateDevice: (target: DeviceActionTarget) => Promise<Device>;
}

const resolveActionLocationId = (
  overrideLocationId: string | null | undefined,
  selectedLocationId: string | null,
): string | null => overrideLocationId ?? selectedLocationId;

const useDeviceErrorToaster = () => {
  const { t } = useTranslation('common');

  return (error: DeviceError) => {
    const message = resolveDeviceToastMessage({ error, t });
    if (message) {
      toaster.error({ description: message });
    }
  };
};

export const useDeviceActions = ({
  accountId,
}: UseDeviceActionsOptions): UseDeviceActionsResult => {
  const selectedLocationId = useUiStore(locationSelectionSelectors.selectedLocationId(accountId));
  const setSelectedLocationId = useUiStore(locationSelectionSelectors.setSelectedLocationId);
  const handleError = useDeviceErrorToaster();

  const activateMutation = useActivateDevice({
    scope: { accountId },
    options: {
      onError: handleError,
    },
  });

  const configureMutation = useConfigureDevice({
    scope: { accountId },
    options: {
      onError: handleError,
    },
  });

  const deactivateMutation = useDeactivateDevice({
    scope: { accountId },
    options: {
      onError: handleError,
    },
  });

  const syncSelectedLocationId = (locationId: string | null | undefined): string | null => {
    if (!accountId || !locationId) {
      return null;
    }

    if (selectedLocationId !== locationId) {
      setSelectedLocationId(accountId, locationId);
    }

    return locationId;
  };

  return {
    isActivatePending: activateMutation.isPending,
    isConfigurePending: configureMutation.isPending,
    isDeactivatePending: deactivateMutation.isPending,
    syncSelectedLocationId,
    activateDevice: async ({ deviceId, locationId }, values) => {
      const nextLocationId = resolveActionLocationId(
        locationId || values.locationId,
        selectedLocationId,
      );
      if (!nextLocationId) {
        throw new Error('Device location is required');
      }

      syncSelectedLocationId(nextLocationId);

      return activateMutation.mutateAsync({
        id: deviceId,
        input: values,
        previousLocationId: selectedLocationId,
      });
    },
    configureDevice: async ({ deviceId, locationId }, values) => {
      const nextLocationId = resolveActionLocationId(locationId, selectedLocationId);
      if (!nextLocationId) {
        throw new Error('Device location is required');
      }

      syncSelectedLocationId(nextLocationId);

      return configureMutation.mutateAsync({
        id: deviceId,
        input: mapConfigureDeviceFormValues(values, nextLocationId),
        previousLocationId: selectedLocationId,
      });
    },
    deactivateDevice: async ({ deviceId, locationId }) => {
      const nextLocationId = resolveActionLocationId(locationId, selectedLocationId);
      syncSelectedLocationId(nextLocationId);

      return deactivateMutation.mutateAsync({
        id: deviceId,
        previousLocationId: selectedLocationId ?? nextLocationId,
      });
    },
  };
};
