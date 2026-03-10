import { AppIcon } from '@/shared/ui';
import { Box, Button } from '@chakra-ui/react';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SidebarLogoutButtonProps {
  isCompactUi: boolean;
  isCollapsingToCompact: boolean;
  isLoading: boolean;
  onLogout: () => void;
}

export function SidebarLogoutButton({
  isCompactUi,
  isCollapsingToCompact,
  isLoading,
  onLogout,
}: SidebarLogoutButtonProps) {
  const { t } = useTranslation('common');

  return (
    <Button
      data-testid='auth-logout-button'
      variant='ghost'
      justifyContent={isCompactUi ? 'center' : 'flex-start'}
      width='full'
      loading={isLoading}
      onClick={onLogout}
      color='fg.muted'
      gap='3'
    >
      <AppIcon
        icon={LogOut}
        size={16}
      />
      {!isCompactUi && (
        <Box
          as='span'
          whiteSpace='nowrap'
          style={{
            opacity: isCollapsingToCompact ? 0 : 1,
            transition: 'opacity 120ms ease',
          }}
        >
          {t('workspace.logout')}
        </Box>
      )}
    </Button>
  );
}
