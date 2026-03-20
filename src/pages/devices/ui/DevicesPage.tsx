import { Button, Heading, Spinner, Stack } from '@chakra-ui/react';
import { MapPinIcon, Plus } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDevices } from '@/entities/device';
import { useLocationSelection } from '@/features/location-selection';
import { EmptyState } from '@/shared/ui';
import { useDeviceQueryErrorToast } from '../lib/useDeviceQueryErrorToast';
import { useDevicesListState } from '../lib/useDevicesListState';
import { AddDeviceModal } from './AddDeviceModal';
import { DevicesTable } from './DevicesTable';

export default function DevicesPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { accountId, isHydrated, isSessionPending, selectedLocationId } = useLocationSelection();

  const devicesQuery = useDevices({
    scope: {
      accountId,
      locationId: selectedLocationId,
    },
    options: {
      enabled: Boolean(accountId && selectedLocationId),
    },
  });

  useDeviceQueryErrorToast({ error: devicesQuery.error });

  const listState = useDevicesListState({
    devices: devicesQuery.data,
    isDevicesPending: devicesQuery.isPending,
    selectedLocationId,
  });

  const isSelectionPending = isSessionPending || !isHydrated;

  if (isSelectionPending) {
    return (
      <Stack
        align='center'
        justify='center'
        minH='40'
        w='full'
      >
        <Spinner size='lg' />
      </Stack>
    );
  }

  return (
    <Stack
      gap='5'
      maxW='4xl'
      w='full'
    >
      <Stack
        flexDir='row'
        justify='space-between'
      >
        <Heading size='md'>{t('workspace.sections.devices.title')}</Heading>
        <Button
          w='fit'
          variant='subtle'
          size='xs'
          color='fg.muted'
          onClick={() => setIsModalOpen(true)}
        >
          <Plus style={{ width: '12' }} /> {t('workspace.devicesPage.addDeviceModal.triggerButton')}
        </Button>
      </Stack>

      {listState.isLocationNotSelected ? (
        <EmptyState
          data-testid='devices-location-required'
          title={t('workspace.devicesPage.locationRequiredTitle')}
          description={t('workspace.devicesPage.locationRequiredDescription')}
          actionCards={[
            {
              title: t('workspace.devicesPage.locationRequiredCardTitle'),
              description: t('workspace.devicesPage.locationRequiredCardDescription'),
              href: '/locations',
              icon: MapPinIcon,
            },
          ]}
        />
      ) : null}

      {listState.isEmpty ? (
        <EmptyState
          data-testid='devices-empty-state'
          title={t('workspace.devicesPage.emptyTitle')}
          description={t('workspace.devicesPage.emptyDescription')}
        />
      ) : null}

      {listState.isLoading ? (
        <Stack
          align='center'
          justify='center'
          minH='32'
          w='full'
        >
          <Spinner size='lg' />
        </Stack>
      ) : null}

      {!listState.isLocationNotSelected && !listState.isEmpty && !listState.isLoading ? (
        <DevicesTable
          data-testid='devices-list'
          devices={listState.devices}
          onOpen={(deviceId) => {
            void router.push(`/devices/${deviceId}`);
          }}
        />
      ) : null}

      <AddDeviceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </Stack>
  );
}
