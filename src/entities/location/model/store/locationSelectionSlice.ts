import type { StateCreator } from 'zustand/vanilla';
import type { Location } from '../types';

export interface LocationSelectionSlice {
  isHydrated: boolean;
  markHydrated: () => void;
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
  resolveSelectedLocationId: (accountId, locations, preferredId) => {
    const accountSelection = get().selectedLocationIdByAccountId[accountId] ?? null;
    const nextSelectedId = resolveSelectedLocationId(locations, preferredId ?? accountSelection);
    set((state) => {
      if (state.selectedLocationIdByAccountId[accountId] === nextSelectedId) {
        return state;
      }

      return {
        selectedLocationIdByAccountId: {
          ...state.selectedLocationIdByAccountId,
          [accountId]: nextSelectedId,
        },
      };
    });
    return nextSelectedId;
  },
  selectedLocationIdByAccountId: {},
  setSelectedLocationId: (accountId, id) => {
    set((state) => {
      if (state.selectedLocationIdByAccountId[accountId] === id) {
        return state;
      }

      return {
        selectedLocationIdByAccountId: {
          ...state.selectedLocationIdByAccountId,
          [accountId]: id,
        },
      };
    });
  },
});

export const locationSelectionSelectors = {
  selectedLocationId:
    (accountId: string | null) =>
    (state: LocationSelectionSlice): string | null =>
      state.selectedLocationIdByAccountId[accountId ?? ''] ?? null,
  isHydrated: (state: LocationSelectionSlice): boolean => state.isHydrated,
  setSelectedLocationId: (state: LocationSelectionSlice) => state.setSelectedLocationId,
  resolveSelectedLocationId: (state: LocationSelectionSlice) => state.resolveSelectedLocationId,
} as const;
