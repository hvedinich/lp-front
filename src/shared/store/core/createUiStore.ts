import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

interface CreateUiStoreOptions<TState extends object> {
  name: string;
  partialize?: (state: TState) => Partial<TState>;
  onRehydrateStorage?: (state: TState) => void;
  version?: number;
}

const createNoopStorage = () => ({
  getItem: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
});

const createClientStorage = () =>
  createJSONStorage(() => {
    if (typeof window === 'undefined') {
      return createNoopStorage();
    }

    return window.localStorage;
  });

export const createUiStore = <TState extends object>(
  initializer: StateCreator<TState, [], []>,
  options: CreateUiStoreOptions<TState>,
): StoreApi<TState> => {
  return createStore<TState>()(
    persist(initializer, {
      name: options.name,
      onRehydrateStorage: () => (state) => {
        if (state) {
          options.onRehydrateStorage?.(state);
        }
      },
      partialize: options.partialize,
      storage: createClientStorage(),
      version: options.version,
    }),
  );
};
