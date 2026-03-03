import { useUiStore } from '@/shared/store';
import { sidebarUiSelectors } from './store/sidebarUiSlice';

interface SidebarContextValue {
  /** Sidebar is collapsed to icon-only mode (desktop). */
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile Drawer is open. */
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

/** Sidebar state hook backed by Zustand UI store. */
export function useSidebar(): SidebarContextValue {
  const isCollapsed = useUiStore(sidebarUiSelectors.isCollapsed);
  const toggleCollapsed = useUiStore(sidebarUiSelectors.toggleCollapsed);
  const isMobileOpen = useUiStore(sidebarUiSelectors.isMobileOpen);
  const openMobile = useUiStore(sidebarUiSelectors.openMobile);
  const closeMobile = useUiStore(sidebarUiSelectors.closeMobile);

  return {
    isCollapsed,
    toggleCollapsed,
    isMobileOpen,
    openMobile,
    closeMobile,
  };
}
