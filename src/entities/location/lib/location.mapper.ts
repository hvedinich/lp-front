import type {
  LocationDto,
  CreateLocationDtoRequest,
  UpdateLocationDtoRequest,
} from '../api/location.dto';
import type { Location, LocationFormValues } from '../model/types';

export const locationFormDefaultValues: LocationFormValues = {
  address: '',
  isDefault: false,
  name: '',
  phone: '',
  publicSlug: '',
  timeZone: '',
  website: '',
};

const toNullable = (value: string) => {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const mapLocationToFormValues = (location: Location): LocationFormValues => ({
  address: location.address ?? '',
  isDefault: location.isDefault,
  name: location.name,
  phone: location.phone ?? '',
  publicSlug: location.publicSlug,
  timeZone: location.timeZone ?? '',
  website: location.website ?? '',
});

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

export const mapUpdateLocationFormValues = (
  values: LocationFormValues,
): UpdateLocationDtoRequest => ({
  address: toNullable(values.address),
  isDefault: values.isDefault,
  name: values.name.trim(),
  phone: toNullable(values.phone),
  timeZone: toNullable(values.timeZone),
  website: toNullable(values.website),
});

export const mapLocationDto = (dto: LocationDto): Location => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});
