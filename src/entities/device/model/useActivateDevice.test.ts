import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { activateDevice } from '../api/activateDevice';
import { invalidateDevices } from './invalidateDevices';
import { useActivateDevice } from './useActivateDevice';
import { DeviceModeEnum } from '@/shared/lib';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
  useQueryClient: vi.fn(),
}));

vi.mock('../api/activateDevice', () => ({
  activateDevice: vi.fn(),
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
      path: '/devices/dev-1/activate',
      skipAuthRefresh: false,
      url: 'https://api.test/devices/dev-1/activate',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });
};

describe('useActivateDevice', () => {
  const useMutationMock = vi.mocked(useMutation);
  const useQueryClientMock = vi.mocked(useQueryClient);
  const activateDeviceMock = vi.mocked(activateDevice);
  const invalidateDevicesMock = vi.mocked(invalidateDevices);
  const setQueryData = vi.fn();

  beforeEach(() => {
    useMutationMock.mockClear();
    activateDeviceMock.mockReset();
    invalidateDevicesMock.mockClear();
    setQueryData.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData } as never);
  });

  it('calls activate transport and performs targeted cache updates on success', async () => {
    activateDeviceMock.mockResolvedValue({
      accountId: 'acc-1',
      connectedAt: '2026-03-01T00:00:00.000Z',
      createdAt: '2026-03-01T00:00:00.000Z',
      id: 'dev-1',
      locale: 'en',
      locationId: 'loc-2',
      mode: DeviceModeEnum.SINGLE,
      name: 'Lobby',
      shortCode: 'ABCD-1234',
      status: 'active',
      targetUrl: 'https://example.com',
      type: 'tablet',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });

    const onSuccess = vi.fn();
    const mutation = useActivateDevice({
      options: { onSuccess },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: {
        id: string;
        input: { locationId: string; mode: DeviceModeEnum.SINGLE; singleLinkUrl: string };
        previousLocationId?: string | null;
      }) => Promise<{ locationId: string }>;
      onSuccess?: (...args: unknown[]) => void;
    };

    const payload = {
      id: 'dev-1',
      input: {
        locationId: 'loc-2',
        mode: DeviceModeEnum.SINGLE as const,
        singleLinkUrl: 'https://example.com',
      },
      previousLocationId: 'loc-1',
    };
    const data = await mutation.mutationFn(payload);

    expect(activateDeviceMock).toHaveBeenCalledWith({ id: 'dev-1', input: payload.input });

    mutation.onSuccess?.(data, payload, undefined, undefined);
    expect(setQueryData).toHaveBeenCalledWith(
      ['devices', 'account', 'acc-1', 'item', 'dev-1'],
      data,
    );
    expect(invalidateDevicesMock).toHaveBeenCalledWith(expect.any(Object), 'acc-1', [
      'loc-1',
      'loc-2',
    ]);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('maps transport error in mutationFn', async () => {
    activateDeviceMock.mockRejectedValue(
      createApiError(422, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payload',
        },
      }),
    );

    const mutation = useActivateDevice({
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: {
        id: string;
        input: { locationId: string; mode: DeviceModeEnum.MULTI };
      }) => Promise<unknown>;
    };

    await expect(
      mutation.mutationFn({
        id: 'dev-1',
        input: { locationId: 'loc-1', mode: DeviceModeEnum.MULTI },
      }),
    ).rejects.toEqual({
      code: 'VALIDATION_ERROR',
      issues: undefined,
      message: 'Invalid payload',
    });
  });
});
