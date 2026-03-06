import { describe, expect, it, vi } from 'vitest';
import { invalidateDevices } from './invalidateDevices';

describe('invalidateDevices', () => {
  it('invalidates only matching location-scoped list keys', async () => {
    const invalidateQueries = vi.fn(() => Promise.resolve());

    await invalidateDevices({ invalidateQueries } as never, 'acc-1', [
      'loc-1',
      'loc-2',
      'loc-1',
      undefined,
      null,
    ]);

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: [
        'devices',
        'account',
        'acc-1',
        'list',
        {
          filters: {
            locationId: 'loc-1',
          },
          limit: undefined,
          offset: undefined,
          sort: undefined,
        },
      ],
    });
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: [
        'devices',
        'account',
        'acc-1',
        'list',
        {
          filters: {
            locationId: 'loc-2',
          },
          limit: undefined,
          offset: undefined,
          sort: undefined,
        },
      ],
    });
  });

  it('falls back to all account lists when location ids are missing', async () => {
    const invalidateQueries = vi.fn(() => Promise.resolve());

    await invalidateDevices({ invalidateQueries } as never, 'acc-1');

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['devices', 'account', 'acc-1', 'list'],
    });
  });
});
