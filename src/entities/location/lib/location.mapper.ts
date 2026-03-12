import { toNullable } from '@/shared/lib';
import type { LocationDto, CreateLocationDtoRequest } from '../api/location.dto';
import type { Location, LocationFormValues } from '../model/types';

export const mapCreateLocationFormValues = (
  values: LocationFormValues,
): CreateLocationDtoRequest => ({
  address: toNullable(values.address),
  name: values.name.trim(),
  phone: toNullable(values.phone),
  publicSlug: values.publicSlug.trim() || undefined,
  timeZone: toNullable(values.timeZone),
  website: toNullable(values.website),
});

export const mapLocationDto = (dto: LocationDto): Location => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});
