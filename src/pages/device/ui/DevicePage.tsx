import { Button, Heading, Spinner, Stack, Tabs, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useDeviceById } from '@/entities/device';
import { useLocationSelection } from '@/features/location-selection';
import { DeviceSettingsTab } from './DeviceSettingsTab';
import { Trash2 } from 'lucide-react';

export default function DevicePage() {
  const router = useRouter();
  const { t } = useTranslation('common');

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

  if (deviceQuery.isPending) {
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

  const device = deviceQuery.data;

  if (!device) {
    return null;
  }

  return (
    <Stack>
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
          // onClick={() => setIsModalOpen(true)}
        >
          <Trash2 style={{ width: '12' }} /> {t('workspace.devicePage.settings.deleteButton')}
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
    </Stack>
  );
}
