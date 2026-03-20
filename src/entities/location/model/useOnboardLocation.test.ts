import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { useOnboardLocation } from './useOnboardLocation';

import { onboardLocation } from '../api/onboardLocation';
import { OnboardLocationPayload, OnboardLocationResponse } from '../api/location.dto';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
  useQueryClient: vi.fn(),
}));

vi.mock('../api/onboardLocation', () => ({
  onboardLocation: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const createApiError = (status: number, payload?: unknown) =>
  new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'POST',
      path: '/onboarding/locations',
      skipAuthRefresh: false,
      url: 'https://api.test/onboarding/locations',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makePayload = (overrides: Partial<OnboardLocationPayload> = {}): OnboardLocationPayload => ({
  name: 'Main Branch',
  address: '1 Main St',
  publishedConfig: { links: '[]' },
  ...overrides,
});

const makeResponse = (
  overrides: Partial<OnboardLocationResponse> = {},
): OnboardLocationResponse => ({
  location: {
    id: 'loc-1',
    accountId: 'acc-1',
    name: 'Main Branch',
    phone: null,
    website: null,
    address: '1 Main St',
    timeZone: null,
    publicSlug: 'main-branch',
    isDefault: false,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  hostedPage: {
    id: 'hp-1',
    accountId: 'acc-1',
    locationId: 'loc-1',
    publishedConfig: {},
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useOnboardLocation', () => {
  const useMutationMock = vi.mocked(useMutation);
  const useQueryClientMock = vi.mocked(useQueryClient);
  const onboardLocationMock = vi.mocked(onboardLocation);
  const invalidateQueries = vi.fn();

  beforeEach(() => {
    useMutationMock.mockClear();
    onboardLocationMock.mockReset();
    invalidateQueries.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries } as never);
  });

  it('mutationFn calls createOnboardingLocation with the payload and returns the response', async () => {
    const response = makeResponse();
    onboardLocationMock.mockResolvedValue(response);

    const mutation = useOnboardLocation({ scope: { accountId: 'acc-1' } }) as unknown as {
      mutationFn: (input: OnboardLocationPayload) => Promise<OnboardLocationResponse>;
    };

    const result = await mutation.mutationFn(makePayload());

    expect(onboardLocationMock).toHaveBeenCalledWith(makePayload());
    expect(result).toEqual(response);
  });

  it('mutationFn maps 422 transport error to VALIDATION_ERROR', async () => {
    onboardLocationMock.mockRejectedValue(
      createApiError(422, {
        error: { code: 'VALIDATION_ERROR', message: 'Invalid location data' },
      }),
    );

    const mutation = useOnboardLocation({ scope: { accountId: 'acc-1' } }) as unknown as {
      mutationFn: (input: OnboardLocationPayload) => Promise<OnboardLocationResponse>;
    };

    await expect(mutation.mutationFn(makePayload())).rejects.toEqual({
      code: 'VALIDATION_ERROR',
      issues: undefined,
      message: 'Invalid location data',
    });
  });

  it('mutationFn maps 401 transport error to UNAUTHORIZED', async () => {
    onboardLocationMock.mockRejectedValue(
      createApiError(401, { error: { message: 'Not authorized' } }),
    );

    const mutation = useOnboardLocation({ scope: { accountId: 'acc-1' } }) as unknown as {
      mutationFn: (input: OnboardLocationPayload) => Promise<OnboardLocationResponse>;
    };

    await expect(mutation.mutationFn(makePayload())).rejects.toEqual({
      code: 'UNAUTHORIZED',
      issues: undefined,
      message: 'Not authorized',
    });
  });

  it('onSuccess invalidates the location list query for the account', () => {
    const mutation = useOnboardLocation({ scope: { accountId: 'acc-1' } }) as unknown as {
      onSuccess: (data: OnboardLocationResponse, ...args: unknown[]) => void;
    };

    mutation.onSuccess(makeResponse(), makePayload(), undefined, undefined);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['locations', 'account', 'acc-1', 'list'],
    });
  });

  it('onSuccess invalidates the location item query for the returned location', () => {
    const mutation = useOnboardLocation({ scope: { accountId: 'acc-1' } }) as unknown as {
      onSuccess: (data: OnboardLocationResponse, ...args: unknown[]) => void;
    };

    mutation.onSuccess(
      makeResponse({ location: { ...makeResponse().location, id: 'loc-42' } }),
      makePayload(),
      undefined,
      undefined,
    );

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['locations', 'account', 'acc-1', 'item', 'loc-42'],
    });
  });

  it('onSuccess calls options.onSuccess callback', () => {
    const onSuccess = vi.fn();
    const mutation = useOnboardLocation({
      options: { onSuccess },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      onSuccess: (data: OnboardLocationResponse, ...args: unknown[]) => void;
    };

    mutation.onSuccess(makeResponse(), makePayload(), undefined, undefined);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('forwards onError from options', () => {
    const onError = vi.fn();
    const mutation = useOnboardLocation({
      options: { onError },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      onError: typeof onError;
    };

    expect(mutation.onError).toBe(onError);
  });

  it('forwards onSettled from options', () => {
    const onSettled = vi.fn();
    const mutation = useOnboardLocation({
      options: { onSettled },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      onSettled: typeof onSettled;
    };

    expect(mutation.onSettled).toBe(onSettled);
  });

  it('forwards onMutate from options', () => {
    const onMutate = vi.fn();
    const mutation = useOnboardLocation({
      options: { onMutate },
      scope: { accountId: 'acc-1' },
    }) as unknown as {
      onMutate: typeof onMutate;
    };

    expect(mutation.onMutate).toBe(onMutate);
  });
});
