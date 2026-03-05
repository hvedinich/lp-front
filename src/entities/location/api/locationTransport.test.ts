import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/shared/api';
import { createLocation } from './createLocation';
import { getLocation } from './getLocation';
import { updateLocation } from './updateLocation';

vi.mock('@/shared/api', () => ({
  apiRequest: vi.fn(),
}));

describe('location transport wrappers', () => {
  const apiRequestMock = vi.mocked(apiRequest);

  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('calls GET /locations/:id for getLocation', async () => {
    apiRequestMock.mockResolvedValue({ id: 'loc-1' });

    await getLocation('loc-1');

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'GET',
      path: '/locations/loc-1',
    });
  });

  it('calls POST /locations with body for createLocation', async () => {
    apiRequestMock.mockResolvedValue({ id: 'loc-2' });

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

  it('calls PATCH /locations/:id with body for updateLocation', async () => {
    apiRequestMock.mockResolvedValue({ id: 'loc-2' });

    await updateLocation('loc-2', {
      isDefault: true,
      name: 'Main Updated',
    });

    expect(apiRequestMock).toHaveBeenCalledWith({
      body: {
        isDefault: true,
        name: 'Main Updated',
      },
      method: 'PATCH',
      path: '/locations/loc-2',
    });
  });
});
