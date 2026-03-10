import type { Device } from '@/entities/device';

interface UseDevicesListStateOptions {
  devices: Device[] | null | undefined;
  isDevicesPending?: boolean;
  selectedLocationId: string | null | undefined;
}

interface UseDevicesListStateResult {
  devices: Device[];
  isEmpty: boolean;
  isLoading: boolean;
  isLocationNotSelected: boolean;
}

export const useDevicesListState = ({
  devices,
  isDevicesPending = false,
  selectedLocationId,
}: UseDevicesListStateOptions): UseDevicesListStateResult => {
  const resolvedDevices = devices ?? [];
  const isLocationNotSelected = !selectedLocationId;
  const isLoading = !isLocationNotSelected && isDevicesPending;
  const isEmpty = !isLoading && !isLocationNotSelected && resolvedDevices.length === 0;

  return {
    devices: resolvedDevices,
    isEmpty,
    isLoading,
    isLocationNotSelected,
  };
};
