import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { deactivateDevice } from '../api/deactivateDevice';
import { invalidateDevices } from './invalidateDevices';
import { useDeactivateDevice } from './useDeactivateDevice';
import { DeviceModeEnum } from './types';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
  useQueryClient: vi.fn(),
}));

vi.mock('../api/deactivateDevice', () => ({
  deactivateDevice: vi.fn(),
}));

vi.mock('./invalidateDevices', () => ({
  invalidateDevices: vi.fn(() => Promise.resolve()),
}));

const createApiError = (status: number, payload?: unknown) => {
  return new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'PATCH',
      path: '/devices/dev-1/deactivate',
      skipAuthRefresh: false,
      url: 'https://api.test/devices/dev-1/deactivate',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });
};

describe('useDeactivateDevice', () => {
  const useMutationMock = vi.mocked(useMutation);
  const useQueryClientMock = vi.mocked(useQueryClient);
  const deactivateDeviceMock = vi.mocked(deactivateDevice);
  const invalidateDevicesMock = vi.mocked(invalidateDevices);
  const setQueryData = vi.fn();

  beforeEach(() => {
    useMutationMock.mockClear();
    deactivateDeviceMock.mockReset();
    invalidateDevicesMock.mockClear();
    setQueryData.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData } as never);
  });

  it('calls deactivate transport and performs targeted cache updates on success', async () => {
    deactivateDeviceMock.mockResolvedValue({
      accountId: 'acc-1',
      connectedAt: null,
      createdAt: '2026-03-01T00:00:00.000Z',
      id: 'dev-1',
      locale: 'en',
      locationId: 'loc-1',
      mode: DeviceModeEnum.SINGLE,
      name: 'Lobby',
      shortCode: 'ABCD-1234',
      status: 'disabled',
      targetUrl: null,
      type: 'tablet',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });

    const onSuccess = vi.fn();
    const mutation = useDeactivateDevice({
      options: { onSuccess },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: { id: string; previousLocationId?: string | null }) => Promise<{
        locationId: string;
      }>;
      onSuccess?: (...args: unknown[]) => void;
    };

    const payload = {
      id: 'dev-1',
      previousLocationId: 'loc-1',
    };
    const data = await mutation.mutationFn(payload);

    expect(deactivateDeviceMock).toHaveBeenCalledWith('dev-1');

    mutation.onSuccess?.(data, payload, undefined, undefined);
    expect(setQueryData).toHaveBeenCalledWith(
      ['devices', 'account', 'acc-1', 'item', 'dev-1'],
      data,
    );
    expect(invalidateDevicesMock).toHaveBeenCalledWith(expect.any(Object), 'acc-1', [
      'loc-1',
      'loc-1',
    ]);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('maps transport error in mutationFn', async () => {
    deactivateDeviceMock.mockRejectedValue(
      createApiError(404, {
        error: {
          code: 'NOT_FOUND',
          message: 'Device is missing',
        },
      }),
    );

    const mutation = useDeactivateDevice({
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: { id: string }) => Promise<unknown>;
    };

    await expect(mutation.mutationFn({ id: 'dev-1' })).rejects.toEqual({
      code: 'NOT_FOUND',
      issues: undefined,
      message: 'Device is missing',
    });
  });
});
