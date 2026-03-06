import type { LucideIcon } from 'lucide-react';
import {
  Megaphone,
  MapPin,
  MessageSquare,
  MonitorSmartphone,
  ClipboardCheck,
  ScanLine,
} from 'lucide-react';

export interface NavItem {
  key: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { key: 'reviews', path: '/', icon: MessageSquare },
  { key: 'surveys', path: '/surveys', icon: ClipboardCheck },
  { key: 'scans', path: '/scans', icon: ScanLine },
  { key: 'campaigns', path: '/campaigns', icon: Megaphone },
  { key: 'devices', path: '/devices', icon: MonitorSmartphone },
  { key: 'locations', path: '/locations', icon: MapPin },
];

/** Returns the nav item matching the current pathname, falling back to the first item. */
export const getActiveNavItem = (pathname: string): NavItem => {
  return (
    navItems.find((item) =>
      item.path === '/' ? pathname === '/' : pathname.startsWith(item.path),
    ) ?? navItems[0]!
  );
};

// ── Legacy — used by demo HomePage; remove when real section pages are implemented ────────────

export const workspaceSections = [
  'reviews',
  'surveys',
  'scans',
  'campaigns',
  'devices',
  'locations',
] as const;

export type WorkspaceSection = (typeof workspaceSections)[number];

export const isWorkspaceSection = (value: string): value is WorkspaceSection =>
  workspaceSections.includes(value as WorkspaceSection);

export const getWorkspaceSection = (value: string | undefined): WorkspaceSection => {
  if (value && isWorkspaceSection(value)) return value;
  return 'reviews';
};
