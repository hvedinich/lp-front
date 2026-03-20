import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/shared/api';
import { onboardLocation } from './onboardLocation';
import { OnboardLocationPayload, OnboardLocationResponse } from './location.dto';

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makePayload = (overrides: Partial<OnboardLocationPayload> = {}): OnboardLocationPayload => ({
  name: 'Main Branch',
  address: '1 Main St',
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

describe('onboardLocation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls apiRequest with POST method', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardLocation(makePayload());

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST' }));
  });

  it('calls apiRequest with the onboarding locations path', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardLocation(makePayload());

    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/onboarding/locations' }),
    );
  });

  it('passes the full payload as the request body', async () => {
    const payload = makePayload();
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardLocation(payload);

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ body: payload }));
  });

  it('calls apiRequest exactly once per invocation', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardLocation(makePayload());

    expect(apiRequest).toHaveBeenCalledOnce();
  });

  it('returns the response from apiRequest', async () => {
    const response = makeResponse({ location: { ...makeResponse().location, id: 'loc-42' } });
    vi.mocked(apiRequest).mockResolvedValueOnce(response);

    const result = await onboardLocation(makePayload());

    expect(result).toEqual(response);
  });

  it('propagates errors thrown by apiRequest', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Network failure'));

    await expect(onboardLocation(makePayload())).rejects.toThrow('Network failure');
  });

  it('passes publishedConfig in the body when provided', async () => {
    const payload = makePayload({ publishedConfig: { links: '[]', theme: 'dark' } });
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardLocation(payload);

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ body: payload }));
  });

  it('works with an empty payload', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardLocation({});

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ body: {} }));
  });
});
