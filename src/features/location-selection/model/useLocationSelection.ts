import { useEffect, useMemo } from 'react';
import { useHasActiveSession } from '@/entities/auth';
import { locationSelectionSelectors, useLocations } from '@/entities/location';
import { useUiStore } from '@/shared/store';

export const useLocationSelection = () => {
  const sessionQuery = useHasActiveSession();
  const accountId = sessionQuery.data?.payload?.account.id ?? null;
  const isHydrated = useUiStore(locationSelectionSelectors.isHydrated);
  const setSelectedLocationId = useUiStore(locationSelectionSelectors.setSelectedLocationId);
  const resolveSelectedLocationId = useUiStore(
    locationSelectionSelectors.resolveSelectedLocationId,
  );
  const selectedLocationId = useUiStore(locationSelectionSelectors.selectedLocationId(accountId));

  const locationsQuery = useLocations({
    scope: {
      accountId,
      params: { sort: 'name' },
    },
  });

  const selectedLocation = useMemo(
    () => locationsQuery.data?.find((location) => location.id === selectedLocationId) ?? null,
    [locationsQuery.data, selectedLocationId],
  );

  useEffect(() => {
    if (!accountId || !isHydrated || !locationsQuery.isSuccess) {
      return;
    }

    resolveSelectedLocationId(accountId, locationsQuery.data);
  }, [
    accountId,
    isHydrated,
    locationsQuery.data,
    locationsQuery.isSuccess,
    resolveSelectedLocationId,
  ]);

  const onSelectLocation = (locationId: string) => {
    if (!accountId) {
      return;
    }

    setSelectedLocationId(accountId, locationId);
  };

  return {
    accountId,
    isHydrated,
    locations: locationsQuery.data ?? [],
    locationsQuery,
    onSelectLocation,
    selectedLocation,
    selectedLocationId,
  };
};
