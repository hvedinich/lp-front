import { type ReactNode, useState } from 'react';
import { createLocationSelectionSlice, type LocationSelectionSlice } from '@/entities/location';
import { createSidebarUiSlice, type SidebarUiSlice } from '@/widgets/mainLayout';
import { createUiStore, UiStoreRootProvider } from '@/shared/store';

const STORE_KEY = 'lp:ui:selected-location-id-by-account';

export type UiStoreState = LocationSelectionSlice & SidebarUiSlice;

const createUiStoreInstance = () => {
  return createUiStore<UiStoreState>(
    (...params) => ({
      ...createLocationSelectionSlice(...params),
      ...createSidebarUiSlice(...params),
    }),
    {
      name: STORE_KEY,
      onRehydrateStorage: (state) => {
        state.markHydrated();
      },
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        selectedLocationIdByAccountId: state.selectedLocationIdByAccountId,
      }),
      version: 2,
    },
  );
};

interface UiStoreProviderProps {
  children: ReactNode;
}

export const UiStoreProvider = ({ children }: UiStoreProviderProps) => {
  const [store] = useState(createUiStoreInstance);

  return <UiStoreRootProvider store={store}>{children}</UiStoreRootProvider>;
};
