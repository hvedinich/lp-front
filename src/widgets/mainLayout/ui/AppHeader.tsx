import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { Menu, PanelLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { AppIcon, ThemeSwitcher } from '@/shared/ui';
import { useSidebar } from '../model/SidebarContext';
import { getActiveNavItem } from '../model/navigation';

/**
 * AppHeader — sticky top bar inside the authenticated layout.
 *
 * Left slot: sidebar toggle + current section title.
 * Right slot: ThemeSwitcher.
 *
 * Sidebar toggle behavior:
 * - mobile (< md): opens the mobile Drawer
 * - desktop (>= md): collapses / expands the sidebar
 */
export function AppHeader() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isCollapsed, toggleCollapsed, openMobile } = useSidebar();

  const activeItem = getActiveNavItem(router.pathname);

  return (
    <Flex
      as='header'
      bg='bg.canvas'
      borderBottomWidth='thin'
      borderColor='border.default'
      h='layout.header.h'
      align='center'
      justify='space-between'
      px='4'
      gap='2'
      flexShrink={0}
    >
      <Flex
        align='center'
        gap='2'
      >
        {/* Mobile: hamburger — opens Drawer */}
        <Button
          display={{ base: 'flex', md: 'none' }}
          variant='ghost'
          size='sm'
          aria-label={t('workspace.openMenu')}
          onClick={openMobile}
        >
          <AppIcon
            icon={Menu}
            size={18}
          />
        </Button>

        {/* Desktop: panel-left icon — collapse / expand sidebar */}
        <Button
          display={{ base: 'none', md: 'flex' }}
          variant='ghost'
          size='sm'
          aria-label={isCollapsed ? t('workspace.expandSidebar') : t('workspace.collapseSidebar')}
          onClick={toggleCollapsed}
        >
          <AppIcon
            icon={PanelLeft}
            size={18}
          />
        </Button>

        <Heading
          as='h1'
          size='md'
          fontWeight='semibold'
          color='fg.default'
        >
          {t(`workspace.menu.${activeItem.key}`)}
        </Heading>
      </Flex>

      <Box flexShrink={0}>
        <ThemeSwitcher />
      </Box>
    </Flex>
  );
}
