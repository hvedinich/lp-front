import { HostedPageDTO } from '@/entities/_contracts';
import type { ListQueryParams } from '@/shared/lib';

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
  pageConfig?: Record<string, unknown>;
}

export interface UpdateLocationDtoRequest {
  name?: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  timeZone?: string | null;
  isDefault?: boolean;
}

export type LocationListFilters = {
  name?: string;
};

export type LocationSortField = 'name' | 'createdAt' | 'updatedAt';

export type GetLocationsParams = ListQueryParams<LocationListFilters, LocationSortField>;

export interface OnboardLocationPayload extends UpdateLocationDtoRequest {
  publishedConfig?: Record<string, unknown>;
}

export interface OnboardLocationResponse {
  location: LocationDto;
  hostedPage: HostedPageDTO;
}
