import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '@/shared/api';
import { getPlaceDetails } from './google-places.api';
import { useGetPlaceDetails } from './useGetPlaceDetails';
import type { PlaceDetails } from './google-places.types';

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
      path: '/places/place-1',
      skipAuthRefresh: false,
      url: 'https://api.test/places/place-1',
    },
    durationMs: 1,
    message: 'Request failed',
    payload,
    status,
  });

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeDetails = (overrides: Partial<PlaceDetails> = {}): PlaceDetails => ({
  placeId: 'place-1',
  name: 'Acme HQ',
  formattedAddress: '1 Main St, Warsaw',
  phone: '+48123456789',
  website: 'https://acme.com',
  ...overrides,
});

type MutationOptions = {
  mutationFn: (vars: { placeId: string; sessionToken?: string }) => Promise<PlaceDetails | null>;
  onSuccess?: (...args: unknown[]) => void;
  onError?: (...args: unknown[]) => void;
  onSettled?: (...args: unknown[]) => void;
  onMutate?: (...args: unknown[]) => void;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useGetPlaceDetails', () => {
  const useMutationMock = vi.mocked(useMutation);
  const getPlaceDetailsMock = vi.mocked(getPlaceDetails);

  beforeEach(() => {
    useMutationMock.mockClear();
    getPlaceDetailsMock.mockReset();
  });

  it('mutationFn calls getPlaceDetails with placeId and sessionToken', async () => {
    getPlaceDetailsMock.mockResolvedValue(makeDetails());

    const mutation = useGetPlaceDetails() as unknown as MutationOptions;

    await mutation.mutationFn({ placeId: 'place-1', sessionToken: 'tok-1' });

    expect(getPlaceDetailsMock).toHaveBeenCalledWith('place-1', 'tok-1');
  });

  it('mutationFn passes undefined sessionToken when not provided', async () => {
    getPlaceDetailsMock.mockResolvedValue(makeDetails());

    const mutation = useGetPlaceDetails() as unknown as MutationOptions;

    await mutation.mutationFn({ placeId: 'place-1' });

    expect(getPlaceDetailsMock).toHaveBeenCalledWith('place-1', undefined);
  });

  it('mutationFn returns the place details from the transport', async () => {
    const details = makeDetails({ name: 'Beta Corp' });
    getPlaceDetailsMock.mockResolvedValue(details);

    const mutation = useGetPlaceDetails() as unknown as MutationOptions;

    const result = await mutation.mutationFn({ placeId: 'place-1' });

    expect(result).toEqual(details);
  });

  it('mutationFn returns null when the transport returns null', async () => {
    getPlaceDetailsMock.mockResolvedValue(null);

    const mutation = useGetPlaceDetails() as unknown as MutationOptions;

    const result = await mutation.mutationFn({ placeId: 'place-1' });

    expect(result).toBeNull();
  });

  it('mutationFn maps 404 transport error to NOT_FOUND', async () => {
    getPlaceDetailsMock.mockRejectedValue(
      createApiError(404, { error: { message: 'Place not found' } }),
    );

    const mutation = useGetPlaceDetails() as unknown as MutationOptions;

    await expect(mutation.mutationFn({ placeId: 'place-1' })).rejects.toEqual({
      code: 'NOT_FOUND',
      issues: undefined,
      message: 'Place not found',
    });
  });

  it('mutationFn maps a network error to NETWORK', async () => {
    getPlaceDetailsMock.mockRejectedValue(createApiError(0, undefined));

    const mutation = useGetPlaceDetails() as unknown as MutationOptions;

    await expect(mutation.mutationFn({ placeId: 'place-1' })).rejects.toMatchObject({
      code: 'NETWORK',
    });
  });

  it('forwards onSuccess from options', () => {
    const onSuccess = vi.fn();
    const mutation = useGetPlaceDetails({
      scope: {},
      options: { onSuccess },
    }) as unknown as MutationOptions;

    expect(mutation.onSuccess).toBe(onSuccess);
  });

  it('forwards onError from options', () => {
    const onError = vi.fn();
    const mutation = useGetPlaceDetails({
      scope: {},
      options: { onError },
    }) as unknown as MutationOptions;

    expect(mutation.onError).toBe(onError);
  });

  it('forwards onSettled from options', () => {
    const onSettled = vi.fn();
    const mutation = useGetPlaceDetails({
      scope: {},
      options: { onSettled },
    }) as unknown as MutationOptions;

    expect(mutation.onSettled).toBe(onSettled);
  });

  it('forwards onMutate from options', () => {
    const onMutate = vi.fn();
    const mutation = useGetPlaceDetails({
      scope: {},
      options: { onMutate },
    }) as unknown as MutationOptions;

    expect(mutation.onMutate).toBe(onMutate);
  });
});
