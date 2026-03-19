import { Grid, type StackProps } from '@chakra-ui/react';
import type { Device } from '@/entities/device';
import { DeviceCard } from './DeviceCard';

interface DevicesListProps extends Omit<StackProps, 'children'> {
  devices: Device[];
  onOpen: (deviceId: string) => void;
}

export function DevicesList({ devices, onOpen, ...rest }: DevicesListProps) {
  return (
    <Grid
      gap='2'
      templateColumns={{ base: '1fr', md: '1fr 1fr' }}
    >
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          onOpen={onOpen}
        />
      ))}
    </Grid>
  );
}
