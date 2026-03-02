import { useLogoutUser } from '@/features/auth';
import { AppBrand, LogoutIcon, XIcon } from '@/shared/ui';
import { Box, Button, Drawer, Flex, Separator } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../model/SidebarContext';
import { navItems, type NavItem } from '../model/navigation';
import { NavButtons } from './NavButtons';

export function MainSidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutUser({
    onSettled: () => void router.replace('/login'),
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
          collapsed={isCollapsed}
          px='1'
        />

        {/* Navigation */}
        <NavButtons
          items={navItems}
          activePath={router.pathname}
          collapsed={isCollapsed}
          onSelect={handleSelectItem}
          getLabel={getItemLabel}
          mt='3'
        />

        {/* Spacer — pushes logout to bottom */}
        <Box flex='1' />

        {/* Logout */}
        <Separator />
        <Button
          variant='ghost'
          justifyContent={isCollapsed ? 'center' : 'flex-start'}
          width='full'
          loading={isLoggingOut}
          onClick={() => logout()}
          color='fg.muted'
          gap='3'
          mt='1'
        >
          <LogoutIcon size={16} />
          {!isCollapsed && t('workspace.logout')}
        </Button>
      </Box>

      {/* Mobile Drawer — triggered from AppHeader */}
      <Drawer.Root
        open={isMobileOpen}
        onOpenChange={({ open }) => {
          if (!open) closeMobile();
        }}
        placement='start'
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Flex
                align='center'
                justify='space-between'
                w='full'
              >
                <AppBrand px='1' />
                <Button
                  variant='ghost'
                  size='sm'
                  aria-label={t('workspace.closeMenu')}
                  onClick={closeMobile}
                >
                  <XIcon size={16} />
                </Button>
              </Flex>
            </Drawer.Header>

            <Drawer.Body>
              <NavButtons
                items={navItems}
                activePath={router.pathname}
                collapsed={false}
                onSelect={handleSelectItem}
                getLabel={getItemLabel}
              />
            </Drawer.Body>

            <Drawer.Footer
              flexDirection='column'
              alignItems='stretch'
              gap='2'
            >
              <Separator />
              <Button
                variant='ghost'
                justifyContent='flex-start'
                width='full'
                loading={isLoggingOut}
                onClick={() => logout()}
                color='fg.muted'
                gap='3'
              >
                <LogoutIcon size={16} />
                {t('workspace.logout')}
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  );
}
