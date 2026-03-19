import type { ComponentProps } from 'react';
import { Badge, Card, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { type Device, DeviceModeEnum } from '@/entities/device';
// import Link from 'next/link';

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
        <Badge
          colorPalette={device.mode === DeviceModeEnum.MULTI ? 'brand' : 'accent'}
          width='fit'
          borderRadius='xl'
        >
          {modeLabel}
        </Badge>

        <Text
          mt='2'
          fontWeight='semibold'
        >
          {getDeviceTitle(device)}
        </Text>

        {/* <Text
          _hover={{ textDecoration: 'underline' }}
          maxW='full'
          truncate
          fontSize='sm'
        >
          <Link
            target='_blank'
            href={device.targetUrl!}
          >
            {`• ${device.targetUrl}`}
          </Link>
        </Text> */}
      </Card.Body>
    </Card.Root>
  );
}
