export interface PlaceSuggestion {
  placeId: string;
  name: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress?: string;
  phone?: string;
  website?: string;
}
