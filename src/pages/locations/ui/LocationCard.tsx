import { Badge, Box, Card, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Location } from '@/entities/location';
import { AppIcon } from '@/shared/ui';

interface LocationCardProps {
  canManage: boolean;
  isDeletePending: boolean;
  location: Location;
  onDelete: (locationId: string) => Promise<void>;
  onOpen: (locationId: string) => void;
}

export function LocationCard({
  canManage,
  isDeletePending,
  location,
  onDelete,
  onOpen,
}: LocationCardProps) {
  const { t } = useTranslation('common');

  const details =
    [location.address, location.timeZone].filter(Boolean).join(' • ') ||
    t('workspace.locationsPage.noDetails');

  const openDetails = () => onOpen(location.id);

  return (
    <Card.Root
      variant='outlineClickable'
      data-testid={`locations-card-${location.id}`}
      role='button'
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetails();
        }
      }}
    >
      <Card.Body p='4'>
        <Stack gap='3'>
          <HStack
            justify='space-between'
            align='start'
          >
            <Box>
              <HStack>
                <Text fontWeight='semibold'>{location.name}</Text>
                {location.isDefault ? (
                  <Badge
                    colorPalette='green'
                    data-testid={`locations-card-default-badge-${location.id}`}
                  >
                    {t('workspace.locationsPage.defaultBadge')}
                  </Badge>
                ) : null}
              </HStack>
              <Text
                mt='1'
                color='fg.muted'
                fontSize='sm'
              >
                {details}
              </Text>
            </Box>

            {canManage ? (
              <IconButton
                data-testid={`locations-delete-button-${location.id}`}
                size='sm'
                variant='ghost'
                colorPalette='red'
                loading={isDeletePending}
                aria-label={t('workspace.locationsPage.delete')}
                onClick={(event) => {
                  event.stopPropagation();
                  void onDelete(location.id);
                }}
              >
                <AppIcon
                  icon={Trash2Icon}
                  size={16}
                />
              </IconButton>
            ) : null}
          </HStack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
