import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useHasActiveSession } from '@/entities/auth';
import { AppIcon, EmptyState } from '@/shared/ui';
import { useLocationActions, useLocations } from '@/entities/location';
import { canManageLocationsRole } from '../lib/locationPermissions';
import { useLocationQueryErrorToast } from '../lib/useLocationQueryErrorToast';
import { LocationsList } from './LocationsList';

export default function LocationsPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const sessionQuery = useHasActiveSession();
  const accountId = sessionQuery.data?.payload?.account.id ?? '';
  const role = sessionQuery.data?.payload?.account.role;
  const canManage = canManageLocationsRole(role);

  const locationsQuery = useLocations({
    scope: {
      accountId,
      params: { sort: 'name' },
    },
  });

  const { deleteLocation, isDeletePending } = useLocationActions({ accountId });
  useLocationQueryErrorToast({ error: locationsQuery.error });

  const locations = locationsQuery.data ?? [];
  const isEmpty = !locationsQuery.isPending && locations.length === 0;

  return (
    <Stack
      gap='5'
      maxW='3xl'
      w='full'
    >
      <Flex
        align='start'
        justify='space-between'
        gap='4'
      >
        <Box>
          <Heading size={{ base: '2xl', md: '4xl' }}>
            {t('workspace.sections.locations.title')}
          </Heading>
          <Text
            color='fg.muted'
            fontSize={{ base: 'sm', md: 'lg' }}
          >
            {t('workspace.sections.locations.description')}
          </Text>
        </Box>

        {canManage ? (
          <Button
            data-testid='locations-create-button'
            onClick={() => {
              void router.push('/locations/new');
            }}
          >
            <AppIcon
              icon={PlusIcon}
              size={16}
            />
            {t('workspace.locationsPage.create')}
          </Button>
        ) : null}
      </Flex>

      <LocationsList
        data-testid='locations-list'
        locations={locations}
        canManage={canManage}
        isDeletePending={isDeletePending}
        onOpen={(locationId) => {
          void router.push(`/locations/${locationId}`);
        }}
        onDelete={deleteLocation}
      />

      {isEmpty ? (
        <EmptyState
          data-testid='locations-empty-state'
          title={t('workspace.locationsPage.empty')}
          description={t('workspace.sections.locations.emptyState')}
          actionsTitle={t('workspace.locationsPage.emptyActionsTitle')}
          cta={
            canManage
              ? {
                  label: t('workspace.locationsPage.create'),
                  icon: PlusIcon,
                  onClick: () => {
                    void router.push('/locations/new');
                  },
                }
              : undefined
          }
        />
      ) : null}
    </Stack>
  );
}
