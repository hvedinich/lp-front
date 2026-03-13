import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { getDevices } from '../api/getDevices';
import { useDevices } from './useDevices';
import { DeviceModeEnum } from './types';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((options: unknown) => options),
}));

vi.mock('../api/getDevices', () => ({
  getDevices: vi.fn(),
}));

const createApiError = (status: number, payload?: unknown) => {
  return new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'GET',
      path: '/devices',
      skipAuthRefresh: false,
      url: 'https://api.test/devices',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });
};

describe('useDevices', () => {
  const useQueryMock = vi.mocked(useQuery);
  const getDevicesMock = vi.mocked(getDevices);

  beforeEach(() => {
    useQueryMock.mockClear();
    getDevicesMock.mockReset();
  });

  it('builds location-scoped query config and maps dto to domain', async () => {
    getDevicesMock.mockResolvedValue([
      {
        accountId: 'acc-1',
        connectedAt: '2026-03-01T00:00:00.000Z',
        createdAt: '2026-03-01T00:00:00.000Z',
        id: 'dev-1',
        locale: 'en',
        locationId: 'loc-1',
        mode: DeviceModeEnum.SINGLE,
        name: 'Lobby',
        shortCode: 'ABCD-1234',
        status: 'active',
        targetUrl: 'https://example.com',
        type: 'tablet',
        updatedAt: '2026-03-02T00:00:00.000Z',
      },
    ]);

    const queryOptions = useDevices({
      scope: {
        accountId: 'acc-1',
        locationId: 'loc-1',
      },
    }) as unknown as {
      enabled: boolean;
      gcTime: number;
      queryFn: () => Promise<unknown>;
      queryKey: unknown;
      staleTime: number;
    };

    expect(queryOptions.queryKey).toEqual([
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
    ]);
    expect(queryOptions.enabled).toBe(true);
    expect(queryOptions.staleTime).toBe(300_000);
    expect(queryOptions.gcTime).toBe(1_800_000);

    const result = (await queryOptions.queryFn()) as Array<{ connectedAt: Date }>;
    expect(result[0]?.connectedAt).toBeInstanceOf(Date);
    expect(getDevicesMock).toHaveBeenCalledWith({
      filters: {
        locationId: 'loc-1',
      },
    });
  });

  it('disables query when location is missing', () => {
    const queryOptions = useDevices({
      scope: {
        accountId: 'acc-1',
        locationId: null,
      },
      options: { enabled: true },
    }) as unknown as {
      enabled: boolean;
    };

    expect(queryOptions.enabled).toBe(false);
  });

  it('maps transport errors to device error in queryFn', async () => {
    getDevicesMock.mockRejectedValue(
      createApiError(403, {
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden',
        },
      }),
    );

    const queryOptions = useDevices({
      scope: {
        accountId: 'acc-1',
        locationId: 'loc-1',
      },
    }) as unknown as {
      queryFn: () => Promise<unknown>;
    };

    await expect(queryOptions.queryFn()).rejects.toEqual({
      code: 'FORBIDDEN',
      issues: undefined,
      message: 'Forbidden',
    });
  });
});
