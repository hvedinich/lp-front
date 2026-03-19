import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { searchPlaces } from './google-places.api';
import { useSearchPlaces } from './useSearchPlaces';
import type { PlaceSuggestion } from './google-places.types';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
}));

vi.mock('./google-places.api', () => ({
  searchPlaces: vi.fn(),
  getPlaceDetails: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const createApiError = (status: number, payload?: unknown) =>
  new ApiError({
    code: null,
    context: {
      attempt: 0,
      method: 'GET',
      path: '/places/search',
      skipAuthRefresh: false,
      url: 'https://api.test/places/search',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeSuggestion = (overrides: Partial<PlaceSuggestion> = {}): PlaceSuggestion => ({
  placeId: 'place-1',
  name: 'Acme HQ',
  ...overrides,
});

type MutationOptions = {
  mutationFn: (vars: { input: string; sessionToken?: string }) => Promise<PlaceSuggestion[]>;
  onSuccess?: (...args: unknown[]) => void;
  onError?: (...args: unknown[]) => void;
  onSettled?: (...args: unknown[]) => void;
  onMutate?: (...args: unknown[]) => void;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useSearchPlaces', () => {
  const useMutationMock = vi.mocked(useMutation);
  const searchPlacesMock = vi.mocked(searchPlaces);

  beforeEach(() => {
    useMutationMock.mockClear();
    searchPlacesMock.mockReset();
  });

  it('mutationFn calls searchPlaces with input, sessionToken, and scope region', async () => {
    searchPlacesMock.mockResolvedValue([]);

    const mutation = useSearchPlaces({
      scope: { region: 'pl' },
    }) as unknown as MutationOptions;

    await mutation.mutationFn({ input: 'Acme', sessionToken: 'tok-1' });

    expect(searchPlacesMock).toHaveBeenCalledWith({
      input: 'Acme',
      sessionToken: 'tok-1',
      region: 'pl',
    });
  });

  it('mutationFn returns the suggestions from searchPlaces', async () => {
    const suggestions = [makeSuggestion(), makeSuggestion({ placeId: 'place-2', name: 'Beta' })];
    searchPlacesMock.mockResolvedValue(suggestions);

    const mutation = useSearchPlaces({ scope: { region: 'pl' } }) as unknown as MutationOptions;

    const result = await mutation.mutationFn({ input: 'Acme' });

    expect(result).toEqual(suggestions);
  });

  it('mutationFn maps 404 transport error to NOT_FOUND', async () => {
    searchPlacesMock.mockRejectedValue(
      createApiError(404, { error: { message: 'No places found' } }),
    );

    const mutation = useSearchPlaces({ scope: { region: 'pl' } }) as unknown as MutationOptions;

    await expect(mutation.mutationFn({ input: 'Acme' })).rejects.toEqual({
      code: 'NOT_FOUND',
      issues: undefined,
      message: 'No places found',
    });
  });

  it('mutationFn maps a network error to NETWORK', async () => {
    searchPlacesMock.mockRejectedValue(createApiError(0, undefined));

    const mutation = useSearchPlaces({ scope: { region: 'pl' } }) as unknown as MutationOptions;

    await expect(mutation.mutationFn({ input: 'Acme' })).rejects.toMatchObject({
      code: 'NETWORK',
    });
  });

  it('forwards onSuccess from options', () => {
    const onSuccess = vi.fn();
    const mutation = useSearchPlaces({
      scope: { region: 'pl' },
      options: { onSuccess },
    }) as unknown as MutationOptions;

    expect(mutation.onSuccess).toBe(onSuccess);
  });

  it('forwards onError from options', () => {
    const onError = vi.fn();
    const mutation = useSearchPlaces({
      scope: { region: 'pl' },
      options: { onError },
    }) as unknown as MutationOptions;

    expect(mutation.onError).toBe(onError);
  });

  it('forwards onSettled from options', () => {
    const onSettled = vi.fn();
    const mutation = useSearchPlaces({
      scope: { region: 'pl' },
      options: { onSettled },
    }) as unknown as MutationOptions;

    expect(mutation.onSettled).toBe(onSettled);
  });

  it('forwards onMutate from options', () => {
    const onMutate = vi.fn();
    const mutation = useSearchPlaces({
      scope: { region: 'pl' },
      options: { onMutate },
    }) as unknown as MutationOptions;

    expect(mutation.onMutate).toBe(onMutate);
  });
});
