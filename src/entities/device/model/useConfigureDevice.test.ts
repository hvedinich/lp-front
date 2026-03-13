import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { configureDevice } from '../api/configureDevice';
import { invalidateDevices } from './invalidateDevices';
import { useConfigureDevice } from './useConfigureDevice';
import { DeviceModeEnum } from './types';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
  useQueryClient: vi.fn(),
}));

vi.mock('../api/configureDevice', () => ({
  configureDevice: vi.fn(),
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
      path: '/devices/dev-1/configure',
      skipAuthRefresh: false,
      url: 'https://api.test/devices/dev-1/configure',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });
};

describe('useConfigureDevice', () => {
  const useMutationMock = vi.mocked(useMutation);
  const useQueryClientMock = vi.mocked(useQueryClient);
  const configureDeviceMock = vi.mocked(configureDevice);
  const invalidateDevicesMock = vi.mocked(invalidateDevices);
  const setQueryData = vi.fn();

  beforeEach(() => {
    useMutationMock.mockClear();
    configureDeviceMock.mockReset();
    invalidateDevicesMock.mockClear();
    setQueryData.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries: vi.fn(), setQueryData } as never);
  });

  it('calls configure transport and performs targeted cache updates on success', async () => {
    configureDeviceMock.mockResolvedValue({
      accountId: 'acc-1',
      connectedAt: '2026-03-01T00:00:00.000Z',
      createdAt: '2026-03-01T00:00:00.000Z',
      id: 'dev-1',
      locale: 'en',
      locationId: 'loc-1',
      mode: DeviceModeEnum.MULTI,
      name: 'Lobby',
      shortCode: 'ABCD-1234',
      status: 'active',
      targetUrl: 'https://example.com',
      type: 'tablet',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });

    const onSuccess = vi.fn();
    const mutation = useConfigureDevice({
      options: { onSuccess },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      mutationFn: (input: {
        id: string;
        input: { locationId: string; mode: DeviceModeEnum.MULTI };
        previousLocationId?: string | null;
      }) => Promise<{ locationId: string }>;
      onSuccess?: (...args: unknown[]) => void;
    };

    const payload = {
      id: 'dev-1',
      input: {
        locationId: 'loc-1',
        mode: DeviceModeEnum.MULTI as const,
      },
      previousLocationId: 'loc-1',
    };
    const data = await mutation.mutationFn(payload);

    expect(configureDeviceMock).toHaveBeenCalledWith('dev-1', payload.input);

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
    configureDeviceMock.mockRejectedValue(
      createApiError(403, {
        error: {
          code: 'FORBIDDEN',
          message: 'Forbidden',
        },
      }),
    );

    const mutation = useConfigureDevice({
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
      code: 'FORBIDDEN',
      issues: undefined,
      message: 'Forbidden',
    });
  });
});
