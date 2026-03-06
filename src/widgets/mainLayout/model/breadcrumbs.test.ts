import { describe, expect, it } from 'vitest';
import { resolveAppBreadcrumbs } from './breadcrumbs';

const baseInput = {
  deviceListLabel: 'Devices',
  fallbackLabel: 'Location',
  locationCreateLabel: 'Create location',
  locationDynamicLabel: 'Main office',
  locationListLabel: 'Locations',
  sectionLabel: 'Reviews',
};

describe('resolveAppBreadcrumbs', () => {
  it('returns static devices list breadcrumb', () => {
    expect(
      resolveAppBreadcrumbs({
        ...baseInput,
        pathname: '/devices',
      }),
    ).toEqual([{ label: 'Devices' }]);
  });

  it('returns static location list breadcrumb', () => {
    expect(
      resolveAppBreadcrumbs({
        ...baseInput,
        pathname: '/locations',
      }),
    ).toEqual([{ label: 'Locations' }]);
  });

  it('returns create route breadcrumbs', () => {
    expect(
      resolveAppBreadcrumbs({
        ...baseInput,
        pathname: '/locations/new',
      }),
    ).toEqual([{ href: '/locations', label: 'Locations' }, { label: 'Create location' }]);
  });

  it('returns dynamic id fallback when item name is missing', () => {
    expect(
      resolveAppBreadcrumbs({
        ...baseInput,
        locationDynamicLabel: '',
        pathname: '/locations/[id]',
      }),
    ).toEqual([{ href: '/locations', label: 'Locations' }, { label: 'Location' }]);
  });
});
