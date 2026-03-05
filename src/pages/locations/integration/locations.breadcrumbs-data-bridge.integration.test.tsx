import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import type { Location } from '@/entities/location';
import { locationQueryKeys } from '@/entities/location';
import { resolveAppBreadcrumbs } from '@/widgets/mainLayout';
import { getLocationFromListCache } from '../model/locationCacheBridge';

const location = (id: string, name: string): Location => ({
  id,
  accountId: 'acc-1',
  name,
  phone: null,
  website: null,
  address: null,
  timeZone: null,
  publicSlug: id,
  isDefault: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

const resolveEditBreadcrumbs = (dynamicLabel: string) =>
  resolveAppBreadcrumbs({
    fallbackLabel: 'Location',
    locationCreateLabel: 'Create location',
    locationDynamicLabel: dynamicLabel,
    locationListLabel: 'Locations',
    pathname: '/locations/[id]',
    sectionLabel: 'Workspace',
  });

describe('locations breadcrumbs data bridge integration', () => {
  it('starts with id label, then switches to location name from list cache', () => {
    const accountId = 'acc-1';
    const locationId = 'loc-1';
    const queryClient = new QueryClient();

    const missingFromCache = getLocationFromListCache(queryClient, accountId, locationId);
    const beforeLoad = resolveEditBreadcrumbs(missingFromCache?.name ?? locationId);

    expect(beforeLoad).toEqual([{ href: '/locations', label: 'Locations' }, { label: 'loc-1' }]);

    queryClient.setQueryData(locationQueryKeys.list(accountId, { sort: 'name' }), [
      location('loc-1', 'Main office'),
    ]);

    const fromCache = getLocationFromListCache(queryClient, accountId, locationId);
    const afterLoad = resolveEditBreadcrumbs(fromCache?.name ?? locationId);

    expect(afterLoad).toEqual([
      { href: '/locations', label: 'Locations' },
      { label: 'Main office' },
    ]);
  });
});
