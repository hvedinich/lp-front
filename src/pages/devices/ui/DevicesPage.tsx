import { Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { MapPinIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useDevices } from '@/entities/device';
import { useLocationSelection } from '@/features/location-selection';
import { EmptyState } from '@/shared/ui';
import { useDeviceQueryErrorToast } from '../model/useDeviceQueryErrorToast';
import { useDevicesListState } from '../model/useDevicesListState';
import { DevicesList } from './DevicesList';

export default function DevicesPage() {
  const router = useRouter();
  const { t } = useTranslation('common');

  const { accountId, isHydrated, isSessionPending, locationsQuery, selectedLocationId } =
    useLocationSelection();

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

  const isSelectionPending =
    isSessionPending || !isHydrated || (locationsQuery.isPending && !selectedLocationId);

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
      <Stack gap='1'>
        <Heading size={{ base: '2xl', md: '4xl' }}>{t('workspace.sections.devices.title')}</Heading>
        <Text
          color='fg.muted'
          fontSize={{ base: 'sm', md: 'lg' }}
        >
          {selectedLocationId
            ? t('workspace.devicesPage.selectedLocationDescription')
            : t('workspace.sections.devices.description')}
        </Text>
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
        <DevicesList
          data-testid='devices-list'
          devices={listState.devices}
          onOpen={(deviceId) => {
            void router.push(`/devices/${deviceId}`);
          }}
        />
      ) : null}
    </Stack>
  );
}
