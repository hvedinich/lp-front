import { useLogoutUser } from '@/entities/auth';
import { AppBrand, LogoutIcon, XIcon } from '@/shared/ui';
import { Box, Button, Drawer, Flex, Separator, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useSidebar } from '../model/SidebarContext';
import { getWorkspaceSection, workspaceSections, type WorkspaceSection } from '../model/navigation';
import { NavButtons } from './NavButtons';

export function MainSidebar() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutUser();

  const activeSection = getWorkspaceSection(
    typeof router.query.section === 'string' ? router.query.section : undefined,
  );

  const handleSelectSection = (section: WorkspaceSection) => {
    void router.push({ pathname: '/', query: { section } });
    closeMobile();
  };

  const getSectionLabel = (section: WorkspaceSection) => t(`workspace.menu.${section}`);

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
        h='dvh'
        overflow='hidden'
        p='3'
        gap='3'
        transition='[width 0.2s ease]'
        flexShrink={0}
      >
        {/* Brand slot */}
        <Flex
          align='center'
          justify={isCollapsed ? 'center' : 'flex-start'}
          py='2'
          px='1'
          minH='10'
        >
          <AppBrand collapsed={isCollapsed} />
        </Flex>

        {/* Section heading — visible only when expanded */}
        {!isCollapsed && (
          <Text
            color='fg.muted'
            textTransform='uppercase'
            fontWeight='semibold'
            letterSpacing='widest'
            fontSize='xs'
            px='1'
          >
            {t('workspace.menuTitle')}
          </Text>
        )}

        {/* Navigation */}
        <NavButtons
          sections={workspaceSections}
          activeSection={activeSection}
          collapsed={isCollapsed}
          onSelect={handleSelectSection}
          getLabel={getSectionLabel}
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
                <AppBrand />
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
                sections={workspaceSections}
                activeSection={activeSection}
                collapsed={false}
                onSelect={handleSelectSection}
                getLabel={getSectionLabel}
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
