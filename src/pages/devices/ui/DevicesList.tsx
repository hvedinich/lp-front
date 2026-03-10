import { Stack, type StackProps } from '@chakra-ui/react';
import type { Device } from '@/entities/device';
import { DeviceCard } from './DeviceCard';

interface DevicesListProps extends Omit<StackProps, 'children'> {
  devices: Device[];
  onOpen: (deviceId: string) => void;
}

export function DevicesList({ devices, onOpen, ...rest }: DevicesListProps) {
  return (
    <Stack
      gap='3'
      {...rest}
    >
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          onOpen={onOpen}
        />
      ))}
    </Stack>
  );
}
