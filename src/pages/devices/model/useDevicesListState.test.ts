import { describe, expect, it } from 'vitest';
import { useDevicesListState } from './useDevicesListState';

describe('useDevicesListState', () => {
  it('returns location-not-selected state and disables loading/empty', () => {
    expect(
      useDevicesListState({
        canManage: true,
        devices: [],
        isDevicesPending: true,
        selectedLocationId: null,
      }),
    ).toEqual({
      devices: [],
      isEmpty: false,
      isLoading: false,
      isLocationNotSelected: true,
      isReadonly: false,
    });
  });

  it('returns empty state only after location is selected and loading is done', () => {
    expect(
      useDevicesListState({
        canManage: false,
        devices: [],
        isDevicesPending: false,
        selectedLocationId: 'loc-1',
      }),
    ).toEqual({
      devices: [],
      isEmpty: true,
      isLoading: false,
      isLocationNotSelected: false,
      isReadonly: true,
    });
  });
});
