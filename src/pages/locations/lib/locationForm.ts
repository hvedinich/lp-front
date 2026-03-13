import { Location, LocationFormValues, UpdateLocationDtoRequest } from '@/entities/location';
import { toNullable } from '@/shared/lib';

export const locationFormDefaultValues: LocationFormValues = {
  address: '',
  isDefault: false,
  name: '',
  phone: '',
  publicSlug: '',
  timeZone: '',
  website: '',
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
