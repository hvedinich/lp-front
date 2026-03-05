import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/shared/api';
import { getLocation } from './getLocation';

vi.mock('@/shared/api', () => ({
  apiRequest: vi.fn(),
}));

describe('getLocation', () => {
  const apiRequestMock = vi.mocked(apiRequest);

  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('calls apiRequest with GET by id', async () => {
    apiRequestMock.mockResolvedValue({
      accountId: 'acc-1',
      address: null,
      createdAt: '2026-03-01T00:00:00.000Z',
      id: 'loc-1',
      isDefault: false,
      name: 'Main',
      phone: null,
      publicSlug: 'main',
      timeZone: null,
      updatedAt: '2026-03-01T00:00:00.000Z',
      website: null,
    });

    await getLocation('loc-1');

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'GET',
      path: '/locations/loc-1',
    });
  });
});
