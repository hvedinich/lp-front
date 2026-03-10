import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { getLocation } from '../api/getLocation';
import { useLocationById } from './useLocationById';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((options: unknown) => options),
}));

vi.mock('../api/getLocation', () => ({
  getLocation: vi.fn(),
}));

const createApiError = (status: number, payload?: unknown) => {
  return new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'GET',
      path: '/locations/loc-1',
      skipAuthRefresh: false,
      url: 'https://api.test/locations/loc-1',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });
};

describe('useLocationById', () => {
  const useQueryMock = vi.mocked(useQuery);
  const getLocationMock = vi.mocked(getLocation);

  beforeEach(() => {
    useQueryMock.mockClear();
    getLocationMock.mockReset();
  });

  it('builds item query config and maps dto to domain', async () => {
    getLocationMock.mockResolvedValue({
      accountId: 'acc-1',
      address: null,
      createdAt: '2026-03-01T00:00:00.000Z',
      id: 'loc-1',
      isDefault: true,
      name: 'Main',
      phone: null,
      publicSlug: 'main',
      timeZone: null,
      updatedAt: '2026-03-02T00:00:00.000Z',
      website: null,
    });

    const queryOptions = useLocationById({
      scope: {
        accountId: 'acc-1',
        id: 'loc-1',
      },
    }) as unknown as {
      enabled: boolean;
      gcTime: number;
      queryFn: () => Promise<unknown>;
      queryKey: unknown;
      staleTime: number;
    };

    expect(queryOptions.queryKey).toEqual(['locations', 'account', 'acc-1', 'item', 'loc-1']);
    expect(queryOptions.enabled).toBe(true);
    expect(queryOptions.staleTime).toBe(300_000);
    expect(queryOptions.gcTime).toBe(1_800_000);

    const result = (await queryOptions.queryFn()) as { createdAt: Date; updatedAt: Date };
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(getLocationMock).toHaveBeenCalledWith('loc-1');
  });

  it('disables query when id is missing', () => {
    const queryOptions = useLocationById({
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

  it('maps transport errors to location error in queryFn', async () => {
    getLocationMock.mockRejectedValue(
      createApiError(404, {
        error: {
          code: 'NOT_FOUND',
          message: 'Not found',
        },
      }),
    );

    const queryOptions = useLocationById({
      scope: {
        accountId: 'acc-1',
        id: 'loc-1',
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
