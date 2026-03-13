import { describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/shared/api';
import { getHostedPageByLocation } from './api';
import type { HostedPageDTO } from './dto';

vi.mock('@/shared/api', () => ({
  apiRequest: vi.fn(),
}));

const makeDTO = (overrides: Partial<HostedPageDTO> = {}): HostedPageDTO => ({
  id: 'hp-1',
  accountId: 'acc-1',
  locationId: 'loc-1',
  publishedConfig: {},
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  ...overrides,
});

describe('getHostedPageByLocation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls apiRequest with GET method and the correct path', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeDTO());

    await getHostedPageByLocation('loc-1');

    expect(apiRequest).toHaveBeenCalledOnce();
    expect(apiRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/hosted-pages/loc-1',
    });
  });

  it('interpolates the locationId into the path', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(makeDTO({ locationId: 'loc-abc-123' }));

    await getHostedPageByLocation('loc-abc-123');

    expect(apiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/hosted-pages/loc-abc-123' }),
    );
  });

  it('returns the DTO resolved by apiRequest', async () => {
    const dto = makeDTO({
      publishedConfig: { links: JSON.stringify([{ type: 'google', url: 'https://g.co' }]) },
    });
    vi.mocked(apiRequest).mockResolvedValueOnce(dto);

    const result = await getHostedPageByLocation('loc-1');

    expect(result).toEqual(dto);
  });

  it('propagates errors thrown by apiRequest', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Network error'));

    await expect(getHostedPageByLocation('loc-1')).rejects.toThrow('Network error');
  });
});
