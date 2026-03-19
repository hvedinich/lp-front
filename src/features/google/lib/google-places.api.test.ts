import { describe, expect, it, vi, afterEach } from 'vitest';
import { apiRequest } from '@/shared/api';
import { searchPlaces, getPlaceDetails } from './google-places.api';
import type { PlaceSuggestion, PlaceDetails } from './google-places.types';

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeSuggestion = (overrides: Partial<PlaceSuggestion> = {}): PlaceSuggestion => ({
  placeId: 'place-1',
  name: 'Acme HQ',
  ...overrides,
});

const makeDetails = (overrides: Partial<PlaceDetails> = {}): PlaceDetails => ({
  placeId: 'place-1',
  name: 'Acme HQ',
  formattedAddress: '1 Main St, Warsaw',
  phone: '+48 123 456 789',
  website: 'https://acme.com',
  ...overrides,
});

// ── searchPlaces ──────────────────────────────────────────────────────────────

describe('searchPlaces', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls apiRequest with GET method', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce([makeSuggestion()]);

    await searchPlaces({ input: 'Acme', region: 'pl' });

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET' }));
  });

  it('calls apiRequest with the /places/search path', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce([makeSuggestion()]);

    await searchPlaces({ input: 'Acme', region: 'pl' });

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ path: '/places/search' }));
  });

  it('passes input as q, region as country, and sessionToken in params', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce([]);

    await searchPlaces({ input: 'Acme', region: 'pl', sessionToken: 'tok-1' });

    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { q: 'Acme', country: 'pl', sessionToken: 'tok-1' },
      }),
    );
  });

  it('defaults sessionToken to empty string when not provided', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce([]);

    await searchPlaces({ input: 'Acme', region: 'pl' });

    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: expect.objectContaining({ sessionToken: '' }) }),
    );
  });

  it('returns the suggestions from apiRequest', async () => {
    const suggestions = [makeSuggestion(), makeSuggestion({ placeId: 'place-2', name: 'Beta' })];
    vi.mocked(apiRequest).mockResolvedValueOnce(suggestions);

    const result = await searchPlaces({ input: 'Acme', region: 'pl' });

    expect(result).toEqual(suggestions);
  });

  it('returns [] immediately and skips apiRequest when input is empty', async () => {
    const result = await searchPlaces({ input: '', region: 'pl' });

    expect(result).toEqual([]);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('returns [] immediately and skips apiRequest when input is whitespace only', async () => {
    const result = await searchPlaces({ input: '   ', region: 'pl' });

    expect(result).toEqual([]);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('propagates errors thrown by apiRequest', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Network failure'));

    await expect(searchPlaces({ input: 'Acme', region: 'pl' })).rejects.toThrow('Network failure');
  });
});

// ── getPlaceDetails ───────────────────────────────────────────────────────────

describe('getPlaceDetails', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls apiRequest with GET method', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeDetails());

    await getPlaceDetails('place-1');

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET' }));
  });

  it('calls apiRequest with the encoded placeId in the path', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeDetails());

    await getPlaceDetails('place/with-special&chars');

    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/places/${encodeURIComponent('place/with-special&chars')}`,
      }),
    );
  });

  it('passes sessionToken in params', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeDetails());

    await getPlaceDetails('place-1', 'tok-abc');

    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { sessionToken: 'tok-abc' } }),
    );
  });

  it('defaults sessionToken to empty string when not provided', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeDetails());

    await getPlaceDetails('place-1');

    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ params: { sessionToken: '' } }),
    );
  });

  it('returns the place details from apiRequest', async () => {
    const details = makeDetails({ name: 'Beta Corp' });
    vi.mocked(apiRequest).mockResolvedValueOnce(details);

    const result = await getPlaceDetails('place-1');

    expect(result).toEqual(details);
  });

  it('calls apiRequest exactly once per invocation', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeDetails());

    await getPlaceDetails('place-1');

    expect(apiRequest).toHaveBeenCalledOnce();
  });

  it('propagates errors thrown by apiRequest', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Timeout'));

    await expect(getPlaceDetails('place-1')).rejects.toThrow('Timeout');
  });
});
