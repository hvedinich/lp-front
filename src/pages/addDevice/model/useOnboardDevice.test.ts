import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { DeviceModeEnum } from '@/entities/device';
import { onboardDevice } from './onboarding';
import { useOnboardDevice } from './useOnboardDevice';
import type { OnboardPayload, DeviceOnboardingResponse } from './types';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
  useQueryClient: vi.fn(),
}));

vi.mock('./onboarding', () => ({
  onboardDevice: vi.fn(),
  createOnboardingLocation: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const createApiError = (status: number, payload?: unknown) =>
  new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'POST',
      path: '/onboarding',
      skipAuthRefresh: false,
      url: 'https://api.test/onboarding',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makePayload = (overrides: Partial<OnboardPayload> = {}): OnboardPayload => ({
  email: 'owner@example.com',
  name: 'Jan Kowalski',
  phone: '+48123456789',
  password: 'secret123',
  account: { name: 'Acme', region: 'pl', contentLanguage: 'pl' },
  location: { name: 'Main Branch', address: '1 Main St', pageConfig: {} },
  device: { id: 'device-1', mode: DeviceModeEnum.MULTI },
  deviceName: 'Google Card',
  ...overrides,
});

const makeResponse = (
  overrides: Partial<DeviceOnboardingResponse> = {},
): DeviceOnboardingResponse => ({
  accessToken: 'access-tok',
  refreshToken: 'refresh-tok',
  locationId: 'loc-1',
  deviceId: 'device-1',
  user: { id: 'user-1', email: 'owner@example.com', name: 'Jan Kowalski' },
  account: { id: 'acc-1', name: 'Acme', role: 'owner' },
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useOnboardDevice', () => {
  const useMutationMock = vi.mocked(useMutation);
  const useQueryClientMock = vi.mocked(useQueryClient);
  const onboardDeviceMock = vi.mocked(onboardDevice);
  const invalidateQueries = vi.fn();

  beforeEach(() => {
    useMutationMock.mockClear();
    onboardDeviceMock.mockReset();
    invalidateQueries.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries } as never);
  });

  it('mutationFn calls onboardDevice with the payload and returns the response', async () => {
    const response = makeResponse();
    onboardDeviceMock.mockResolvedValue(response);

    const mutation = useOnboardDevice() as unknown as {
      mutationFn: (input: OnboardPayload) => Promise<DeviceOnboardingResponse>;
    };

    const result = await mutation.mutationFn(makePayload());

    expect(onboardDeviceMock).toHaveBeenCalledWith(makePayload());
    expect(result).toEqual(response);
  });

  it('mutationFn maps 409 transport error to CONFLICT', async () => {
    onboardDeviceMock.mockRejectedValue(
      createApiError(409, { error: { message: 'Email already in use' } }),
    );

    const mutation = useOnboardDevice() as unknown as {
      mutationFn: (input: OnboardPayload) => Promise<DeviceOnboardingResponse>;
    };

    await expect(mutation.mutationFn(makePayload())).rejects.toEqual({
      code: 'CONFLICT',
      issues: undefined,
      message: 'Email already in use',
    });
  });

  it('mutationFn maps 401 transport error to UNAUTHORIZED', async () => {
    onboardDeviceMock.mockRejectedValue(
      createApiError(401, { error: { message: 'Not authorized' } }),
    );

    const mutation = useOnboardDevice() as unknown as {
      mutationFn: (input: OnboardPayload) => Promise<DeviceOnboardingResponse>;
    };

    await expect(mutation.mutationFn(makePayload())).rejects.toEqual({
      code: 'UNAUTHORIZED',
      issues: undefined,
      message: 'Not authorized',
    });
  });

  it('onSuccess invalidates the auth session query', () => {
    const mutation = useOnboardDevice() as unknown as {
      onSuccess: (...args: unknown[]) => void;
    };

    mutation.onSuccess(makeResponse(), makePayload(), undefined, undefined);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['auth', 'session'] });
  });

  it('onSuccess calls options.onSuccess callback', () => {
    const onSuccess = vi.fn();
    const mutation = useOnboardDevice({ options: { onSuccess }, scope: {} }) as unknown as {
      onSuccess: (...args: unknown[]) => void;
    };

    mutation.onSuccess(makeResponse(), makePayload(), undefined, undefined);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('forwards onError from options', () => {
    const onError = vi.fn();
    const mutation = useOnboardDevice({ options: { onError }, scope: {} }) as unknown as {
      onError: typeof onError;
    };

    expect(mutation.onError).toBe(onError);
  });

  it('forwards onSettled from options', () => {
    const onSettled = vi.fn();
    const mutation = useOnboardDevice({ options: { onSettled }, scope: {} }) as unknown as {
      onSettled: typeof onSettled;
    };

    expect(mutation.onSettled).toBe(onSettled);
  });

  it('forwards onMutate from options', () => {
    const onMutate = vi.fn();
    const mutation = useOnboardDevice({ options: { onMutate }, scope: {} }) as unknown as {
      onMutate: typeof onMutate;
    };

    expect(mutation.onMutate).toBe(onMutate);
  });
});
