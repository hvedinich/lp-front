import { createStore } from 'zustand/vanilla';
import { describe, expect, it } from 'vitest';
import type { Location, LocationSelectionSlice } from '@/entities/location';
import { createLocationSelectionSlice } from '@/entities/location';

const createSelectionStore = () =>
  createStore<LocationSelectionSlice>()((...params) => createLocationSelectionSlice(...params));

const location = (id: string, isDefault = false): Location => ({
  id,
  accountId: 'acc-1',
  name: id,
  phone: null,
  website: null,
  address: null,
  timeZone: null,
  publicSlug: id,
  isDefault,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

describe('locations delete fallback integration', () => {
  it('falls back to default when selected location is deleted', () => {
    const store = createSelectionStore();
    const initial = [location('loc-default', true), location('loc-secondary')];

    store.getState().resolveSelectedLocationId('acc-1', initial, 'loc-secondary');
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe('loc-secondary');

    const afterDelete = [location('loc-default', true)];
    const resolved = store.getState().resolveSelectedLocationId('acc-1', afterDelete);

    expect(resolved).toBe('loc-default');
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe('loc-default');
  });

  it('falls back to first location when default is not available', () => {
    const store = createSelectionStore();
    const initial = [location('loc-a'), location('loc-b')];

    store.getState().resolveSelectedLocationId('acc-1', initial, 'loc-b');
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe('loc-b');

    const afterDelete = [location('loc-a')];
    const resolved = store.getState().resolveSelectedLocationId('acc-1', afterDelete);

    expect(resolved).toBe('loc-a');
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe('loc-a');
  });
});
