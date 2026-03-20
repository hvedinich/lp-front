import { Button, Heading, Stack, Tabs, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useDeviceById } from '@/entities/device';
import { useLocationSelection } from '@/features/location-selection';
import { DeviceSettingsTab } from './DeviceSettingsTab';
import { Trash2 } from 'lucide-react';
import { ConfirmModal, PageSpinner } from '@/shared/ui';
import { useDeviceActions } from '@/features/device-actions';
import { useState } from 'react';

export default function DevicePage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { accountId } = useLocationSelection();
  const deviceId = typeof router.query.id === 'string' ? router.query.id : null;

  const deviceQuery = useDeviceById({
    scope: {
      accountId,
      id: deviceId,
    },
    options: {
      enabled: Boolean(accountId && deviceId),
    },
  });

  const { deactivateDevice, isDeactivatePending, configureDevice } = useDeviceActions({
    accountId: accountId ?? '',
  });

  const device = deviceQuery.data;

  if (deviceQuery.isPending) {
    return <PageSpinner />;
  }

  if (!device) {
    return null;
  }

  const handleDelete = async () => {
    await deactivateDevice({ deviceId: device.id, locationId: device.locationId });
    void router.push('/devices');
  };

  return (
    <Stack w='4xl'>
      <Stack
        direction='row'
        justify='space-between'
      >
        <Heading size='md'>{device.name ?? device.shortCode}</Heading>
        <Button
          w='fit'
          variant='subtle'
          size='xs'
          color='fg.muted'
          loading={isDeactivatePending}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash2 style={{ width: '12' }} /> {t('workspace.devicePage.settings.deleteDevice')}
        </Button>
      </Stack>

      <Tabs.Root defaultValue='settings'>
        <Tabs.List>
          <Tabs.Trigger value='overview'>{t('workspace.devicePage.tabs.overview')}</Tabs.Trigger>
          <Tabs.Trigger value='settings'>{t('workspace.devicePage.tabs.settings')}</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value='overview'>
          <Text
            color='fg.muted'
            pt='4'
          >
            {t('common.comingSoon')}
          </Text>
        </Tabs.Content>

        <Tabs.Content value='settings'>
          <Stack pt='4'>
            <DeviceSettingsTab
              device={device}
              accountId={accountId ?? ''}
            />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={t('workspace.devicePage.settings.deleteDevice')}
        description={t('workspace.devicePage.settings.deleteConfirmDescription')}
        confirmLabel={t('commonActions.delete')}
        cancelLabel={t('commonActions.cancel')}
        onConfirm={() => void handleDelete()}
        isLoading={isDeactivatePending}
      />
    </Stack>
  );
}
