import type { StateCreator } from 'zustand/vanilla';

export interface SidebarUiSlice {
  isSidebarCollapsed: boolean;
  isSidebarMobileOpen: boolean;
  closeSidebarMobile: () => void;
  openSidebarMobile: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

export const createSidebarUiSlice: StateCreator<SidebarUiSlice, [], []> = (set, get) => ({
  isSidebarCollapsed: false,
  isSidebarMobileOpen: false,
  closeSidebarMobile: () => {
    set((state) => {
      if (!state.isSidebarMobileOpen) {
        return state;
      }
      return { isSidebarMobileOpen: false };
    });
  },
  openSidebarMobile: () => {
    set((state) => {
      if (state.isSidebarMobileOpen) {
        return state;
      }
      return { isSidebarMobileOpen: true };
    });
  },
  setSidebarCollapsed: (value) => {
    set((state) => {
      if (state.isSidebarCollapsed === value) {
        return state;
      }
      return { isSidebarCollapsed: value };
    });
  },
  toggleSidebarCollapsed: () => {
    set({ isSidebarCollapsed: !get().isSidebarCollapsed });
  },
});

export const sidebarUiSelectors = {
  isCollapsed: (state: SidebarUiSlice): boolean => state.isSidebarCollapsed,
  isMobileOpen: (state: SidebarUiSlice): boolean => state.isSidebarMobileOpen,
  openMobile: (state: SidebarUiSlice) => state.openSidebarMobile,
  closeMobile: (state: SidebarUiSlice) => state.closeSidebarMobile,
  toggleCollapsed: (state: SidebarUiSlice) => state.toggleSidebarCollapsed,
} as const;
