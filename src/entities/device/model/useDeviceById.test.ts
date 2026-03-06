import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { getDevice } from '../api/getDevice';
import { useDeviceById } from './useDeviceById';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((options: unknown) => options),
}));

vi.mock('../api/getDevice', () => ({
  getDevice: vi.fn(),
}));

const createApiError = (status: number, payload?: unknown) => {
  return new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'GET',
      path: '/devices/dev-1',
      skipAuthRefresh: false,
      url: 'https://api.test/devices/dev-1',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });
};

describe('useDeviceById', () => {
  const useQueryMock = vi.mocked(useQuery);
  const getDeviceMock = vi.mocked(getDevice);

  beforeEach(() => {
    useQueryMock.mockClear();
    getDeviceMock.mockReset();
  });

  it('builds item query config and maps dto to domain', async () => {
    getDeviceMock.mockResolvedValue({
      accountId: 'acc-1',
      connectedAt: '2026-03-01T00:00:00.000Z',
      createdAt: '2026-03-01T00:00:00.000Z',
      id: 'dev-1',
      locale: 'en',
      locationId: 'loc-1',
      mode: 'multilink',
      name: 'Lobby',
      shortCode: 'ABCD-1234',
      status: 'active',
      targetUrl: 'https://example.com',
      type: 'tablet',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });

    const queryOptions = useDeviceById({
      scope: {
        accountId: 'acc-1',
        id: 'dev-1',
      },
    }) as unknown as {
      enabled: boolean;
      gcTime: number;
      queryFn: () => Promise<unknown>;
      queryKey: unknown;
      staleTime: number;
    };

    expect(queryOptions.queryKey).toEqual(['devices', 'account', 'acc-1', 'item', 'dev-1']);
    expect(queryOptions.enabled).toBe(true);
    expect(queryOptions.staleTime).toBe(300_000);
    expect(queryOptions.gcTime).toBe(1_800_000);

    const result = (await queryOptions.queryFn()) as { connectedAt: Date };
    expect(result.connectedAt).toBeInstanceOf(Date);
    expect(getDeviceMock).toHaveBeenCalledWith('dev-1');
  });

  it('disables query when id is missing', () => {
    const queryOptions = useDeviceById({
      scope: {
        accountId: 'acc-1',
        id: null,
      },
      options: { enabled: true },
    }) as unknown as {
      enabled: boolean;
    };

    expect(queryOptions.enabled).toBe(false);
  });

  it('maps transport errors to device error in queryFn', async () => {
    getDeviceMock.mockRejectedValue(
      createApiError(404, {
        error: {
          code: 'NOT_FOUND',
          message: 'Not found',
        },
      }),
    );

    const queryOptions = useDeviceById({
      scope: {
        accountId: 'acc-1',
        id: 'dev-1',
      },
    }) as unknown as {
      queryFn: () => Promise<unknown>;
    };

    await expect(queryOptions.queryFn()).rejects.toEqual({
      code: 'NOT_FOUND',
      issues: undefined,
      message: 'Not found',
    });
  });
});
