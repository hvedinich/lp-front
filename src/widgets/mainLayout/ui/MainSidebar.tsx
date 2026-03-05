import { useLogoutUser } from '@/features/auth';
import { AppBrand } from '@/shared/ui';
import { Box, Separator } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../model/SidebarContext';
import { useSidebarCompactState } from '../model/useSidebarCompactState';
import { navItems, type NavItem } from '../model/navigation';
import { NavButtons } from './NavButtons';
import { SidebarLocationSection } from './SidebarLocationSection';
import { SidebarLogoutButton } from './SidebarLogoutButton';
import { SidebarMobileDrawer } from './SidebarMobileDrawer';

export function MainSidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const { isCompactUi, isCollapsingToCompact } = useSidebarCompactState(isCollapsed);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutUser({
    scope: {},
    options: {
      onSettled: () => void router.replace('/login'),
    },
  });

  const handleSelectItem = (item: NavItem) => {
    void router.push(item.path);
    closeMobile();
  };

  const getItemLabel = (item: NavItem) => t(`workspace.menu.${item.key}`);

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <Box
        as='aside'
        display={{ base: 'none', md: 'flex' }}
        flexDirection='column'
        bg='bg.canvas'
        borderRightWidth='thin'
        borderColor='border.default'
        w={isCollapsed ? 'layout.sidebar.collapsedW' : 'layout.sidebar.w'}
        h='dvh100'
        overflow='hidden'
        p='3'
        gap='3'
        transitionProperty='size'
        transitionDuration='moderate'
        transitionTimingFunction='ease-in-out'
        flexShrink={0}
      >
        {/* Brand slot */}
        <AppBrand
          collapsed={isCompactUi}
          fadeLabel={isCollapsingToCompact}
          px='1'
        />

        <Box />

        <SidebarLocationSection
          isCompactUi={isCompactUi}
          isCollapsingToCompact={isCollapsingToCompact}
        />

        {/* Navigation */}
        <NavButtons
          items={navItems}
          activePath={router.pathname}
          collapsed={isCompactUi}
          fadeLabels={isCollapsingToCompact}
          onSelect={handleSelectItem}
          getLabel={getItemLabel}
        />

        {/* Spacer — pushes logout to bottom */}
        <Box flex='1' />

        {/* Logout */}
        <Separator />
        <Box mt='1'>
          <SidebarLogoutButton
            isCompactUi={isCompactUi}
            isCollapsingToCompact={isCollapsingToCompact}
            isLoading={isLoggingOut}
            onLogout={() => logout()}
          />
        </Box>
      </Box>

      <SidebarMobileDrawer
        isOpen={isMobileOpen}
        closeMobile={closeMobile}
        items={navItems}
        onSelect={handleSelectItem}
        getLabel={getItemLabel}
        isLoggingOut={isLoggingOut}
        onLogout={() => logout()}
      />
    </>
  );
}
