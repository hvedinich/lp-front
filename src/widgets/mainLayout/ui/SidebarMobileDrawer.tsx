import { LocationSelector } from '@/features/location-selection';
import { AppBrand, AppIcon } from '@/shared/ui';
import { Button, Drawer, Flex, Separator } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { type NavItem } from '../model/navigation';
import { NavButtons } from './NavButtons';
import { SidebarLogoutButton } from './SidebarLogoutButton';

interface SidebarMobileDrawerProps {
  isOpen: boolean;
  closeMobile: () => void;
  items: readonly NavItem[];
  onSelect: (item: NavItem) => void;
  getLabel: (item: NavItem) => string;
  isLoggingOut: boolean;
  onLogout: () => void;
}

export function SidebarMobileDrawer({
  isOpen,
  closeMobile,
  items,
  onSelect,
  getLabel,
  isLoggingOut,
  onLogout,
}: SidebarMobileDrawerProps) {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <Drawer.Root
      open={isOpen}
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
                <AppIcon
                  icon={X}
                  size={16}
                />
              </Button>
            </Flex>
          </Drawer.Header>

          <Drawer.Body>
            <LocationSelector
              onLocationSelect={closeMobile}
              mb='4'
            />

            <NavButtons
              items={items}
              activePath={router.pathname}
              collapsed={false}
              onSelect={onSelect}
              getLabel={getLabel}
            />
          </Drawer.Body>

          <Drawer.Footer
            flexDirection='column'
            alignItems='stretch'
            gap='2'
          >
            <Separator />
            <SidebarLogoutButton
              isCompactUi={false}
              isCollapsingToCompact={false}
              isLoading={isLoggingOut}
              onLogout={onLogout}
            />
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
