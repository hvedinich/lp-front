import { Stack, type StackProps } from '@chakra-ui/react';
import type { Location } from '@/entities/location';
import { LocationCard } from './LocationCard';

interface LocationsListProps extends Omit<StackProps, 'children'> {
  canManage: boolean;
  isDeletePending: boolean;
  locations: Location[];
  onDelete: (locationId: string) => Promise<void>;
  onOpen: (locationId: string) => void;
}

export function LocationsList({
  canManage,
  isDeletePending,
  locations,
  onDelete,
  onOpen,
  ...rest
}: LocationsListProps) {
  return (
    <Stack
      gap='3'
      {...rest}
    >
      {locations.map((location) => (
        <LocationCard
          key={location.id}
          location={location}
          canManage={canManage}
          isDeletePending={isDeletePending}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
