import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { createLocation } from '../api/createLocation';
import { invalidateLocations } from './invalidateLocations';
import { useCreateLocation } from './useCreateLocation';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
  useQueryClient: vi.fn(),
}));

vi.mock('../api/createLocation', () => ({
  createLocation: vi.fn(),
}));

vi.mock('./invalidateLocations', () => ({
  invalidateLocations: vi.fn(() => Promise.resolve()),
}));

const createApiError = (status: number, payload?: unknown) => {
  return new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'POST',
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

describe('useCreateLocation', () => {
  const useMutationMock = vi.mocked(useMutation);
  const useQueryClientMock = vi.mocked(useQueryClient);
  const createLocationMock = vi.mocked(createLocation);
  const invalidateLocationsMock = vi.mocked(invalidateLocations);
  const setQueryData = vi.fn();

  beforeEach(() => {
    useMutationMock.mockClear();
    createLocationMock.mockReset();
    invalidateLocationsMock.mockClear();
    setQueryData.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData } as never);
  });

  it('maps mutation result and invalidates locations on success', async () => {
    createLocationMock.mockResolvedValue({
      accountId: 'acc-1',
      address: null,
      createdAt: '2026-03-01T00:00:00.000Z',
      id: 'loc-1',
      isDefault: false,
      name: 'Main',
      phone: null,
      publicSlug: 'main',
      timeZone: null,
      updatedAt: '2026-03-02T00:00:00.000Z',
      website: null,
    });

    const onSuccess = vi.fn();
    const mutation = useCreateLocation({
      options: { onSuccess },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: { name: string }) => Promise<{ createdAt: Date }>;
      onSuccess?: (...args: unknown[]) => void;
    };

    const data = await mutation.mutationFn({ name: 'Main' });

    expect(data.createdAt).toBeInstanceOf(Date);

    mutation.onSuccess?.(data, { name: 'Main' }, undefined, undefined);

    expect(setQueryData).toHaveBeenCalledWith(
      ['locations', 'account', 'acc-1', 'item', 'loc-1'],
      data,
    );
    expect(invalidateLocationsMock).toHaveBeenCalledTimes(1);
    expect(invalidateLocationsMock).toHaveBeenCalledWith(expect.any(Object), 'acc-1', 'loc-1');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('maps transport error in mutationFn', async () => {
    createLocationMock.mockRejectedValue(
      createApiError(422, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
        },
      }),
    );

    const mutation = useCreateLocation({
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: { name: string }) => Promise<unknown>;
    };

    await expect(mutation.mutationFn({ name: '' })).rejects.toEqual({
      code: 'VALIDATION_ERROR',
      issues: undefined,
      message: 'Validation failed',
    });
  });
});
