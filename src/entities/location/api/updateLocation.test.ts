import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/shared/api';
import { updateLocation } from './updateLocation';

vi.mock('@/shared/api', () => ({
  apiRequest: vi.fn(),
}));

describe('updateLocation', () => {
  const apiRequestMock = vi.mocked(apiRequest);

  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('calls apiRequest with PATCH, path and body', async () => {
    apiRequestMock.mockResolvedValue({ id: 'loc-1' });

    await updateLocation('loc-1', {
      isDefault: true,
      name: 'Main Updated',
    });

    expect(apiRequestMock).toHaveBeenCalledWith({
      body: {
        isDefault: true,
        name: 'Main Updated',
      },
      method: 'PATCH',
      path: '/locations/loc-1',
    });
  });
});
