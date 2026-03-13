import { describe, expect, it, vi, afterEach } from 'vitest';
import { apiRequest } from '@/shared/api';
import { onboardDevice } from './onboarding';
import { DeviceModeEnum } from '@/entities/device';
import { DeviceOnboardingResponse, OnboardPayload } from './types';

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makePayload = (overrides: Partial<OnboardPayload> = {}): OnboardPayload => ({
  email: 'owner@example.com',
  name: 'Jan Kowalski',
  phone: '+48123456345',
  password: 'secret123',
  account: {
    name: 'Acme',
    region: 'pl',
    contentLanguage: 'pl',
  },
  location: {
    name: 'Main Branch',
    address: '1 Main St',
    pageConfig: {},
  },
  device: {
    id: 'device-1',
    mode: DeviceModeEnum.MULTI,
  },
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
  user: {
    id: 'user-1',
    email: 'owner@example.com',
    name: 'Jan Kowalski',
  },
  account: {
    id: 'acc-1',
    name: 'Acme',
    role: 'owner',
  },
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('onboardDevice', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls apiRequest with POST method', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardDevice(makePayload());

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST' }));
  });

  it('calls apiRequest with the onboarding path', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardDevice(makePayload());

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ path: '/onboarding' }));
  });

  it('sets skipAuthRefresh: true to avoid redirect loops during onboarding', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardDevice(makePayload());

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ skipAuthRefresh: true }));
  });

  it('passes the full payload as the request body', async () => {
    const payload = makePayload();
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardDevice(payload);

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ body: payload }));
  });

  it('calls apiRequest exactly once per invocation', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardDevice(makePayload());

    expect(apiRequest).toHaveBeenCalledOnce();
  });

  it('returns the response from apiRequest', async () => {
    const response = makeResponse({ accessToken: 'new-tok', deviceId: 'device-42' });
    vi.mocked(apiRequest).mockResolvedValueOnce(response);

    const result = await onboardDevice(makePayload());

    expect(result).toEqual(response);
  });

  it('propagates errors thrown by apiRequest', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Network failure'));

    await expect(onboardDevice(makePayload())).rejects.toThrow('Network failure');
  });

  it('works with a single-mode device payload', async () => {
    const payload = makePayload({
      device: { id: 'device-2', mode: DeviceModeEnum.SINGLE, targetUrl: 'https://g.co/review' },
    });
    vi.mocked(apiRequest).mockResolvedValueOnce(makeResponse());

    await onboardDevice(payload);

    expect(apiRequest).toHaveBeenCalledWith(expect.objectContaining({ body: payload }));
  });
});
