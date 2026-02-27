import { createContext, type ReactNode, useContext, useState } from 'react';

interface SidebarContextValue {
  /** Sidebar is collapsed to icon-only mode (desktop). */
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile Drawer is open. */
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const SIDEBAR_COLLAPSED_KEY = 'lp:sidebar:collapsed';

function readCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const value: SidebarContextValue = {
    isCollapsed,
    toggleCollapsed: () =>
      setIsCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
        return next;
      }),
    isMobileOpen,
    openMobile: () => setIsMobileOpen(true),
    closeMobile: () => setIsMobileOpen(false),
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

/** Consume sidebar state. Must be used inside SidebarProvider. */
export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
