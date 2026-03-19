import type { LocationPayload } from '@/entities/location';
import type { PlaceDetails } from './google-places.types';

/**
 * Subset of the location form schema fields that can be derived from a PlaceDetails response.
 * Matches: locationSchema { name, address, placeId } plus optional payload fields.
 */
interface LocationGoogle extends LocationPayload {
  placeId: string;
}

export function normalizeLocationFromPlace(details: PlaceDetails): LocationGoogle {
  const location: LocationGoogle = {
    name: details.name,
    address: details.formattedAddress ?? '',
    placeId: details.placeId,
  };

  if (details.phone) location.phone = details.phone.replace(/[^+\d]/g, '');
  if (details.website) location.website = details.website;

  return location;
}
