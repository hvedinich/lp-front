export interface LocationDto {
  id: string;
  accountId: string;
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  timeZone: string | null;
  publicSlug: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDtoRequest {
  name: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  timeZone?: string | null;
  publicSlug?: string;
}

export interface UpdateLocationDtoRequest {
  name?: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  timeZone?: string | null;
  isDefault?: boolean;
}

export interface GetLocationsParams {
  name?: string;
  sort?: 'name' | 'createdAt' | 'updatedAt' | '-name' | '-createdAt' | '-updatedAt';
  limit?: number;
  offset?: number;
}
