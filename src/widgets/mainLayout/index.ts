export { MainPageLayout } from './ui/MainPageLayout';
export { withMainLayout } from './lib/withMainLayout';
export { useSidebar } from './model/SidebarContext';
export {
  createSidebarUiSlice,
  sidebarUiSelectors,
  type SidebarUiSlice,
} from './model/store/sidebarUiSlice';
export {
  getActiveNavItem,
  getWorkspaceSection,
  isWorkspaceSection,
  navItems,
  workspaceSections,
  type NavItem,
  type WorkspaceSection,
} from './model/navigation';
