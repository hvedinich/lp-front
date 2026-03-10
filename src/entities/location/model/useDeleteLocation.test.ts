import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { deleteLocation } from '../api/deleteLocation';
import { invalidateLocations } from './invalidateLocations';
import { useDeleteLocation } from './useDeleteLocation';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
  useQueryClient: vi.fn(),
}));

vi.mock('../api/deleteLocation', () => ({
  deleteLocation: vi.fn(),
}));

vi.mock('./invalidateLocations', () => ({
  invalidateLocations: vi.fn(() => Promise.resolve()),
}));

const createApiError = (status: number, payload?: unknown) => {
  return new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'DELETE',
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

describe('useDeleteLocation', () => {
  const useMutationMock = vi.mocked(useMutation);
  const useQueryClientMock = vi.mocked(useQueryClient);
  const deleteLocationMock = vi.mocked(deleteLocation);
  const invalidateLocationsMock = vi.mocked(invalidateLocations);
  const removeQueries = vi.fn();

  beforeEach(() => {
    useMutationMock.mockClear();
    deleteLocationMock.mockReset();
    invalidateLocationsMock.mockClear();
    removeQueries.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries: vi.fn(), removeQueries } as never);
  });

  it('calls delete transport and invalidates on success', async () => {
    deleteLocationMock.mockResolvedValue(undefined);

    const onSuccess = vi.fn();
    const mutation = useDeleteLocation({
      options: { onSuccess },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (locationId: string) => Promise<void>;
      onSuccess?: (...args: unknown[]) => void;
    };

    await mutation.mutationFn('loc-1');

    expect(deleteLocationMock).toHaveBeenCalledWith('loc-1');

    mutation.onSuccess?.(undefined, 'loc-1', undefined, undefined);

    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: ['locations', 'account', 'acc-1', 'item', 'loc-1'],
    });
    expect(invalidateLocationsMock).toHaveBeenCalledWith(expect.any(Object), 'acc-1');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('maps transport error in mutationFn', async () => {
    deleteLocationMock.mockRejectedValue(
      createApiError(404, {
        error: {
          code: 'NOT_FOUND',
          message: 'Location is missing',
        },
      }),
    );

    const mutation = useDeleteLocation({
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (locationId: string) => Promise<void>;
    };

    await expect(mutation.mutationFn('loc-1')).rejects.toEqual({
      code: 'NOT_FOUND',
      issues: undefined,
      message: 'Location is missing',
    });
  });
});
