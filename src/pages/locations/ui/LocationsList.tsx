import { Stack } from '@chakra-ui/react';
import type { Location } from '@/entities/location';
import { LocationCard } from './LocationCard';

interface LocationsListProps {
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
}: LocationsListProps) {
  return (
    <Stack gap='3'>
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
