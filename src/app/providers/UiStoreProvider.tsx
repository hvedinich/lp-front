import { createContext, type ReactNode, useContext, useState } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import { createLocationSelectionSlice, type LocationSelectionSlice } from '@/entities/location';
import { createUiStore } from '@/shared/store';

const STORE_KEY = 'lp:ui:selected-location-id-by-account';

export type UiStoreState = LocationSelectionSlice;

const UiStoreContext = createContext<StoreApi<UiStoreState> | null>(null);

const createUiStoreInstance = () => {
  return createUiStore<UiStoreState>(
    (...params) => ({
      ...createLocationSelectionSlice(...params),
    }),
    {
      name: STORE_KEY,
      onRehydrateStorage: (state) => {
        state.markHydrated();
      },
      partialize: (state) => ({
        selectedLocationIdByAccountId: state.selectedLocationIdByAccountId,
      }),
      version: 1,
    },
  );
};

interface UiStoreProviderProps {
  children: ReactNode;
}

export const UiStoreProvider = ({ children }: UiStoreProviderProps) => {
  const [store] = useState(createUiStoreInstance);

  return <UiStoreContext.Provider value={store}>{children}</UiStoreContext.Provider>;
};

export const useUiStore = <TSelected,>(selector: (state: UiStoreState) => TSelected): TSelected => {
  const store = useContext(UiStoreContext);

  if (!store) {
    throw new Error('useUiStore must be used within UiStoreProvider');
  }

  return useStore(store, selector);
};
