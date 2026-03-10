import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocationActions } from './useLocationActions';

const createMutateAsync = vi.fn();
const updateMutateAsync = vi.fn();
const deleteMutateAsync = vi.fn();

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();

  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

vi.mock('@/shared/ui', () => ({
  toaster: {
    error: vi.fn(),
  },
}));

vi.mock('@/entities/location', () => ({
  useCreateLocation: vi.fn(() => ({
    isPending: false,
    mutateAsync: createMutateAsync,
  })),
  useDeleteLocation: vi.fn(() => ({
    isPending: false,
    mutateAsync: deleteMutateAsync,
  })),
  useUpdateLocation: vi.fn(() => ({
    isPending: true,
    mutateAsync: updateMutateAsync,
  })),
}));

describe('useLocationActions', () => {
  beforeEach(() => {
    createMutateAsync.mockReset();
    updateMutateAsync.mockReset();
    deleteMutateAsync.mockReset();
  });

  it('maps create form values and forwards update/delete calls', async () => {
    createMutateAsync.mockResolvedValue({ id: 'loc-1' });
    updateMutateAsync.mockResolvedValue({ id: 'loc-1' });
    deleteMutateAsync.mockResolvedValue(undefined);

    const actions = useLocationActions({ accountId: 'acc-1' });

    await actions.createLocation({
      address: '',
      isDefault: false,
      name: ' Main ',
      phone: '',
      publicSlug: 'slug',
      timeZone: '',
      website: '',
    });
    await actions.updateLocation('loc-1', { name: 'Main' });
    await actions.deleteLocation('loc-1');

    expect(createMutateAsync).toHaveBeenCalledWith({
      address: null,
      name: 'Main',
      phone: null,
      publicSlug: 'slug',
      timeZone: null,
      website: null,
    });
    expect(updateMutateAsync).toHaveBeenCalledWith({
      id: 'loc-1',
      input: { name: 'Main' },
    });
    expect(deleteMutateAsync).toHaveBeenCalledWith('loc-1');
    expect(actions.isUpdatePending).toBe(true);
  });

  it('swallows delete promise rejections after mutation error handling', async () => {
    deleteMutateAsync.mockRejectedValue(new Error('Delete failed'));

    const actions = useLocationActions({ accountId: 'acc-1' });

    await expect(actions.deleteLocation('loc-1')).resolves.toBeUndefined();
    expect(deleteMutateAsync).toHaveBeenCalledWith('loc-1');
  });
});
