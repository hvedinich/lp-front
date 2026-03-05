import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { getLocations } from '../api/getLocations';
import { useLocations } from './useLocations';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((options: unknown) => options),
}));

vi.mock('../api/getLocations', () => ({
  getLocations: vi.fn(),
}));

const createApiError = (status: number, payload?: unknown) => {
  return new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'GET',
      path: '/locations',
      skipAuthRefresh: false,
      url: 'https://api.test/locations',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });
};

describe('useLocations', () => {
  const useQueryMock = vi.mocked(useQuery);
  const getLocationsMock = vi.mocked(getLocations);

  beforeEach(() => {
    useQueryMock.mockClear();
    getLocationsMock.mockReset();
  });

  it('builds account-scoped query config and maps dto to domain', async () => {
    getLocationsMock.mockResolvedValue([
      {
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
      },
    ]);

    const queryOptions = useLocations({
      scope: {
        accountId: 'acc-1',
        params: { sort: 'name' },
      },
    }) as unknown as {
      enabled: boolean;
      gcTime: number;
      queryFn: () => Promise<unknown>;
      queryKey: unknown;
      staleTime: number;
    };

    expect(queryOptions.queryKey).toEqual([
      'locations',
      'account',
      'acc-1',
      'list',
      {
        limit: undefined,
        name: undefined,
        offset: undefined,
        sort: 'name',
      },
    ]);
    expect(queryOptions.staleTime).toBe(300_000);
    expect(queryOptions.gcTime).toBe(1_800_000);
    expect(queryOptions.enabled).toBe(true);

    const result = (await queryOptions.queryFn()) as Array<{ createdAt: Date; updatedAt: Date }>;
    expect(result[0]?.createdAt).toBeInstanceOf(Date);
    expect(result[0]?.updatedAt).toBeInstanceOf(Date);
    expect(getLocationsMock).toHaveBeenCalledWith({ sort: 'name' });
  });

  it('disables query when account is missing even if options.enabled=true', () => {
    const queryOptions = useLocations({
      scope: {
        accountId: null,
        params: {},
      },
      options: { enabled: true },
    }) as unknown as {
      enabled: boolean;
    };

    expect(queryOptions.enabled).toBe(false);
  });

  it('maps transport errors to location error in queryFn', async () => {
    getLocationsMock.mockRejectedValue(
      createApiError(403, {
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden',
        },
      }),
    );

    const queryOptions = useLocations({
      scope: {
        accountId: 'acc-1',
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
