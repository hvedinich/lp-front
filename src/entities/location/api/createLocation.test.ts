import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/shared/api';
import { createLocation } from './createLocation';

vi.mock('@/shared/api', () => ({
  apiRequest: vi.fn(),
}));

describe('createLocation', () => {
  const apiRequestMock = vi.mocked(apiRequest);

  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('calls apiRequest with POST, path and body', async () => {
    apiRequestMock.mockResolvedValue({ id: 'loc-1' });

    await createLocation({
      address: 'Road 1',
      name: 'Main',
      phone: null,
      publicSlug: 'main',
      timeZone: 'Europe/Warsaw',
      website: null,
    });

    expect(apiRequestMock).toHaveBeenCalledWith({
      body: {
        address: 'Road 1',
        name: 'Main',
        phone: null,
        publicSlug: 'main',
        timeZone: 'Europe/Warsaw',
        website: null,
      },
      method: 'POST',
      path: '/locations',
    });
  });
});
