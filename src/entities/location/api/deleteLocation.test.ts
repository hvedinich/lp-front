import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '@/shared/api';
import { deleteLocation } from './deleteLocation';

vi.mock('@/shared/api', () => ({
  apiRequest: vi.fn(),
}));

describe('deleteLocation', () => {
  const apiRequestMock = vi.mocked(apiRequest);

  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('calls apiRequest with DELETE and void parser', async () => {
    apiRequestMock.mockResolvedValue(undefined);

    await deleteLocation('loc-1');

    expect(apiRequestMock).toHaveBeenCalledWith({
      method: 'DELETE',
      parseAs: 'void',
      path: '/locations/loc-1',
    });
  });
});
