import type { StateCreator } from 'zustand/vanilla';
import type { Location } from '../types';

export interface LocationSelectionSlice {
  isHydrated: boolean;
  markHydrated: () => void;
  resetLocationSelection: (accountId?: string) => void;
  resolveSelectedLocationId: (
    accountId: string,
    locations: Location[],
    preferredId?: string | null,
  ) => string | null;
  selectedLocationIdByAccountId: Record<string, string | null>;
  setSelectedLocationId: (accountId: string, id: string | null) => void;
}

const resolveSelectedLocationId = (
  locations: Location[],
  preferredId: string | null,
): string | null => {
  if (locations.length === 0) {
    return null;
  }

  if (preferredId && locations.some((location) => location.id === preferredId)) {
    return preferredId;
  }

  const defaultLocation = locations.find((location) => location.isDefault);
  if (defaultLocation) {
    return defaultLocation.id;
  }

  return locations[0]?.id ?? null;
};

export const createLocationSelectionSlice: StateCreator<LocationSelectionSlice, [], []> = (
  set,
  get,
) => ({
  isHydrated: false,
  markHydrated: () => {
    set({ isHydrated: true });
  },
  resetLocationSelection: (accountId) => {
    if (!accountId) {
      set({ selectedLocationIdByAccountId: {} });
      return;
    }

    set((state) => ({
      selectedLocationIdByAccountId: {
        ...state.selectedLocationIdByAccountId,
        [accountId]: null,
      },
    }));
  },
  resolveSelectedLocationId: (accountId, locations, preferredId) => {
    const accountSelection = get().selectedLocationIdByAccountId[accountId] ?? null;
    const nextSelectedId = resolveSelectedLocationId(locations, preferredId ?? accountSelection);
    set((state) => ({
      selectedLocationIdByAccountId: {
        ...state.selectedLocationIdByAccountId,
        [accountId]: nextSelectedId,
      },
    }));
    return nextSelectedId;
  },
  selectedLocationIdByAccountId: {},
  setSelectedLocationId: (accountId, id) => {
    set((state) => ({
      selectedLocationIdByAccountId: {
        ...state.selectedLocationIdByAccountId,
        [accountId]: id,
      },
    }));
  },
});

export const selectSelectedLocationId = (accountId: string) => (state: LocationSelectionSlice) =>
  state.selectedLocationIdByAccountId[accountId] ?? null;
export const selectIsHydrated = (state: LocationSelectionSlice): boolean => state.isHydrated;
