import type { APIRequestContext } from '@playwright/test';
import type { ApiLocation, LocationSeed } from '../contracts/backend.types';
import { buildLocationSeedNames, toLocationSlug } from '../builders/location.builder';
import { apiRequest, ensureOk } from './client.api';

export const getLocations = async (request: APIRequestContext): Promise<ApiLocation[]> => {
  const response = await apiRequest<ApiLocation[]>(request, {
    method: 'GET',
    path: '/locations?sort=name',
  });
  ensureOk(response, 'Unable to fetch locations');
  return response.payload ?? [];
};

export const createLocation = async (
  request: APIRequestContext,
  input: {
    name: string;
    publicSlug?: string;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    timeZone?: string | null;
  },
): Promise<ApiLocation> => {
  const response = await apiRequest<ApiLocation>(request, {
    method: 'POST',
    path: '/locations',
    body: {
      name: input.name,
      address: input.address ?? null,
      phone: input.phone ?? null,
      website: input.website ?? null,
      timeZone: input.timeZone ?? null,
      publicSlug: input.publicSlug ?? toLocationSlug(input.name),
    },
  });
  ensureOk(response, 'Unable to create location');
  return response.payload as ApiLocation;
};

export const updateLocation = async (
  request: APIRequestContext,
  id: string,
  input: {
    isDefault?: boolean;
    name?: string;
  },
): Promise<ApiLocation> => {
  const response = await apiRequest<ApiLocation>(request, {
    method: 'PATCH',
    path: `/locations/${id}`,
    body: input,
  });
  ensureOk(response, `Unable to update location ${id}`);
  return response.payload as ApiLocation;
};

export const deleteLocation = async (request: APIRequestContext, id: string): Promise<void> => {
  const response = await apiRequest(request, {
    method: 'DELETE',
    path: `/locations/${id}`,
  });
  ensureOk(response, `Unable to delete location ${id}`);
};

export const cleanupLocationsByPrefix = async (
  request: APIRequestContext,
  prefix: string,
): Promise<void> => {
  const locations = await getLocations(request);
  const createdByPlaywright = locations.filter((location) => location.name.startsWith(prefix));

  for (const location of createdByPlaywright) {
    const response = await apiRequest(request, {
      method: 'DELETE',
      path: `/locations/${location.id}`,
    });

    if (!response.ok && response.status !== 404) {
      ensureOk(response, `Unable to delete location ${location.id}`);
    }
  }
};

export const createLocationSeed = async (
  request: APIRequestContext,
  testPrefix: string,
): Promise<LocationSeed> => {
  const names = buildLocationSeedNames(testPrefix);

  const defaultLocation = await createLocation(request, {
    name: names.defaultName,
    publicSlug: names.defaultSlug,
    address: 'Test address',
    timeZone: 'Europe/Warsaw',
  });
  await updateLocation(request, defaultLocation.id, { isDefault: true });

  const secondaryLocation = await createLocation(request, {
    name: names.secondaryName,
    publicSlug: names.secondarySlug,
    address: 'Secondary test address',
    timeZone: 'Europe/Warsaw',
  });

  return {
    defaultLocation: await updateLocation(request, defaultLocation.id, { isDefault: true }),
    secondaryLocation,
  };
};
