import type { ComponentProps } from 'react';
import { Badge, Box, Card, HStack, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { type Device, DeviceModeEnum } from '@/entities/device';

interface DeviceCardProps extends Omit<
  ComponentProps<typeof Card.Root>,
  'children' | 'onClick' | 'onKeyDown'
> {
  device: Device;
  onOpen: (deviceId: string) => void;
}

const hasName = (device: Device) => Boolean(device.name && device.name.trim().length > 0);

const getDeviceTitle = (device: Device) => (hasName(device) ? device.name! : device.shortCode);

export function DeviceCard({ device, onOpen, ...rest }: DeviceCardProps) {
  const { t } = useTranslation('common');

  const openDetails = () => onOpen(device.id);
  const modeLabel =
    device.mode === DeviceModeEnum.SINGLE
      ? t('workspace.devicesPage.modeStatic')
      : device.mode === DeviceModeEnum.MULTI
        ? t('workspace.devicesPage.modeMultilink')
        : null;
  const secondaryText = hasName(device)
    ? `${t('workspace.devicesPage.shortCodeLabel')}: ${device.shortCode}`
    : t('workspace.devicesPage.noName');
  const details =
    [device.targetUrl, device.type].filter(Boolean).join(' • ') ||
    t('workspace.devicesPage.noTargetUrl');

  return (
    <Card.Root
      variant='outlineClickable'
      data-testid={`devices-card-${device.id}`}
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
      {...rest}
    >
      <Card.Body p='4'>
        <Stack gap='3'>
          <HStack
            justify='space-between'
            align='start'
          >
            <Box>
              <HStack flexWrap='wrap'>
                <Text fontWeight='semibold'>{getDeviceTitle(device)}</Text>
                {modeLabel ? <Badge variant='subtle'>{modeLabel}</Badge> : null}
                <Badge variant='outline'>{device.status}</Badge>
              </HStack>
              <Text
                mt='1'
                color='fg.muted'
                fontSize='sm'
              >
                {secondaryText}
              </Text>
              <Text
                mt='1'
                color='fg.muted'
                fontSize='sm'
              >
                {details}
              </Text>
            </Box>
          </HStack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
