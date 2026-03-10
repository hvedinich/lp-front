import { apiRequest } from '@/shared/api';
import type { PlaceSuggestion, PlaceDetails } from './google-places.types';

export const searchPlaces = async ({
  input,
  sessionToken,
  region,
}: {
  input: string;
  sessionToken?: string;
  region: string;
}): Promise<PlaceSuggestion[]> => {
  if (!input.trim()) return [];

  const params = new URLSearchParams({ q: input, country: region });
  if (sessionToken) params.set('sessionToken', sessionToken);

  return apiRequest<PlaceSuggestion[]>({
    method: 'GET',
    path: `/places/search?${params}`,
  });
};

export const getPlaceDetails = async (
  placeId: string,
  sessionToken?: string,
): Promise<PlaceDetails | null> => {
  const params = sessionToken ? `?sessionToken=${encodeURIComponent(sessionToken)}` : '';

  return apiRequest<PlaceDetails>({
    method: 'GET',
    path: `/places/${encodeURIComponent(placeId)}${params}`,
  });
};
