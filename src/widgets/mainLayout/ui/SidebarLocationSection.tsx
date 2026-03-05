import { LocationSelector } from '@/features/location-selection';
import { AppIcon } from '@/shared/ui';
import { Box, Button, Popover } from '@chakra-ui/react';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SidebarLocationSectionProps {
  isCompactUi: boolean;
  isCollapsingToCompact: boolean;
}

export function SidebarLocationSection({
  isCompactUi,
  isCollapsingToCompact,
}: SidebarLocationSectionProps) {
  const { t } = useTranslation('common');
  const [isLocationPopoverOpen, setLocationPopoverOpen] = useState(false);

  if (!isCompactUi) {
    return (
      <Box
        style={{
          opacity: isCollapsingToCompact ? 0 : 1,
          transition: 'opacity 120ms ease',
        }}
      >
        <LocationSelector />
      </Box>
    );
  }

  return (
    <Popover.Root
      open={isLocationPopoverOpen}
      onOpenChange={({ open }) => setLocationPopoverOpen(open)}
      positioning={{ placement: 'right-start', offset: { mainAxis: 8 } }}
    >
      <Popover.Trigger asChild>
        <Button
          variant='sidebarLocation'
          size='md'
          aria-label={t('workspace.menu.locations')}
        >
          <AppIcon
            icon={MapPin}
            size={18}
          />
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          p='3'
          w='72'
        >
          <LocationSelector onLocationSelect={() => setLocationPopoverOpen(false)} />
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
