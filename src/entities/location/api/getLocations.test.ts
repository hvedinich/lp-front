import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/shared/api';
import { getLocations } from './getLocations';

vi.mock('@/shared/api', () => ({
  apiRequest: vi.fn(),
}));

describe('getLocations', () => {
  const apiRequestMock = vi.mocked(apiRequest);

  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('calls apiRequest with GET and serialized flat query params', async () => {
    apiRequestMock.mockResolvedValue([]);

    await getLocations({
      limit: 50,
      name: 'Roof',
      offset: 10,
      sort: '-updatedAt',
    });

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'GET',
      path: '/locations?name=Roof&sort=-updatedAt&limit=50&offset=10',
    });
  });

  it('calls apiRequest without query when params are empty', async () => {
    apiRequestMock.mockResolvedValue([]);

    await getLocations();

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'GET',
      path: '/locations',
    });
  });
});
