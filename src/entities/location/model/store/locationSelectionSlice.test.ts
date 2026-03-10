import { createStore } from 'zustand/vanilla';
import {
  createLocationSelectionSlice,
  type LocationSelectionSlice,
} from './locationSelectionSlice';

const createTestStore = () => {
  return createStore<LocationSelectionSlice>()((...params) =>
    createLocationSelectionSlice(...params),
  );
};

const location = (id: string, isDefault = false) => ({
  accountId: 'acc-1',
  address: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  id,
  isDefault,
  name: id,
  phone: null,
  publicSlug: id,
  timeZone: null,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  website: null,
});

describe('locationSelectionSlice', () => {
  it('sets and resets selected location id by account', () => {
    const store = createTestStore();

    store.getState().setSelectedLocationId('acc-1', 'loc-1');
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe('loc-1');

    store.getState().setSelectedLocationId('acc-1', null);
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe(null);
  });

  it('resolves to preferred id when preferred exists in locations', () => {
    const store = createTestStore();

    const resolved = store
      .getState()
      .resolveSelectedLocationId('acc-1', [location('loc-1'), location('loc-2')], 'loc-2');

    expect(resolved).toBe('loc-2');
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe('loc-2');
  });

  it('falls back to default location when preferred id is stale', () => {
    const store = createTestStore();

    const resolved = store
      .getState()
      .resolveSelectedLocationId('acc-1', [location('loc-1'), location('loc-2', true)], 'missing');

    expect(resolved).toBe('loc-2');
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe('loc-2');
  });

  it('falls back to first location when no preferred or default exist', () => {
    const store = createTestStore();

    const resolved = store.getState().resolveSelectedLocationId('acc-1', [location('loc-3')]);

    expect(resolved).toBe('loc-3');
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe('loc-3');
  });

  it('returns null and stores null when locations are empty', () => {
    const store = createTestStore();
    store.getState().setSelectedLocationId('acc-1', 'loc-1');

    const resolved = store.getState().resolveSelectedLocationId('acc-1', []);

    expect(resolved).toBe(null);
    expect(store.getState().selectedLocationIdByAccountId['acc-1']).toBe(null);
  });

  it('marks store as hydrated', () => {
    const store = createTestStore();

    expect(store.getState().isHydrated).toBe(false);

    store.getState().markHydrated();

    expect(store.getState().isHydrated).toBe(true);
  });
});
