import { createContext, type ReactNode, useContext } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';

const UiStoreContext = createContext<StoreApi<object> | null>(null);

interface UiStoreRootProviderProps<TState extends object> {
  children: ReactNode;
  store: StoreApi<TState>;
}

export const UiStoreRootProvider = <TState extends object>({
  children,
  store,
}: UiStoreRootProviderProps<TState>) => {
  return (
    <UiStoreContext.Provider value={store as StoreApi<object>}>{children}</UiStoreContext.Provider>
  );
};

export const useUiStore = <TState extends object, TSelected>(
  selector: (state: TState) => TSelected,
): TSelected => {
  const store = useContext(UiStoreContext);

  if (!store) {
    throw new Error('useUiStore must be used within UiStoreRootProvider');
  }

  return useStore(store as StoreApi<TState>, selector);
};
