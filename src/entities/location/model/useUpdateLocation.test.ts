import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { updateLocation } from '../api/updateLocation';
import { invalidateLocations } from './invalidateLocations';
import { useUpdateLocation } from './useUpdateLocation';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
  useQueryClient: vi.fn(),
}));

vi.mock('../api/updateLocation', () => ({
  updateLocation: vi.fn(),
}));

vi.mock('./invalidateLocations', () => ({
  invalidateLocations: vi.fn(() => Promise.resolve()),
}));

const createApiError = (status: number, payload?: unknown) => {
  return new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'PATCH',
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

describe('useUpdateLocation', () => {
  const useMutationMock = vi.mocked(useMutation);
  const useQueryClientMock = vi.mocked(useQueryClient);
  const updateLocationMock = vi.mocked(updateLocation);
  const invalidateLocationsMock = vi.mocked(invalidateLocations);
  const setQueryData = vi.fn();

  beforeEach(() => {
    useMutationMock.mockClear();
    updateLocationMock.mockReset();
    invalidateLocationsMock.mockClear();
    setQueryData.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData } as never);
  });

  it('calls update transport with id/input and invalidates on success', async () => {
    updateLocationMock.mockResolvedValue({
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

    const onSuccess = vi.fn();
    const mutation = useUpdateLocation({
      options: { onSuccess },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: { id: string; input: { name: string } }) => Promise<{ updatedAt: Date }>;
      onSuccess?: (...args: unknown[]) => void;
    };

    const payload = { id: 'loc-1', input: { name: 'Main' } };
    const data = await mutation.mutationFn(payload);

    expect(updateLocationMock).toHaveBeenCalledWith('loc-1', { name: 'Main' });
    expect(data.updatedAt).toBeInstanceOf(Date);

    mutation.onSuccess?.(data, payload, undefined, undefined);
    expect(setQueryData).toHaveBeenCalledWith(
      ['locations', 'account', 'acc-1', 'item', 'loc-1'],
      data,
    );
    expect(invalidateLocationsMock).toHaveBeenCalledWith(expect.any(Object), 'acc-1', 'loc-1');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('maps transport error in mutationFn', async () => {
    updateLocationMock.mockRejectedValue(
      createApiError(403, {
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden',
        },
      }),
    );

    const mutation = useUpdateLocation({
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: { id: string; input: { name: string } }) => Promise<unknown>;
    };

    await expect(mutation.mutationFn({ id: 'loc-1', input: { name: 'x' } })).rejects.toEqual({
      code: 'FORBIDDEN',
      issues: undefined,
      message: 'Forbidden',
    });
  });
});
