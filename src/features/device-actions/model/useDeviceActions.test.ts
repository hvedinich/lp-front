import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceModeEnum } from '@/entities/device';
import { useDeviceActions } from './useDeviceActions';

const {
  activateMutateAsync,
  configureMutateAsync,
  deactivateMutateAsync,
  setSelectedLocationId,
  toasterError,
} = vi.hoisted(() => ({
  activateMutateAsync: vi.fn(),
  configureMutateAsync: vi.fn(),
  deactivateMutateAsync: vi.fn(),
  setSelectedLocationId: vi.fn(),
  toasterError: vi.fn(),
}));

let selectedLocationId: string | null = 'loc-1';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();

  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

vi.mock('@/shared/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/ui')>();
  return {
    ...actual,
    toaster: {
      error: toasterError,
    },
  };
});

vi.mock('@/shared/store', () => ({
  useUiStore: (selector: (state: object) => unknown) =>
    selector({
      selectedLocationIdByAccountId: { 'acc-1': selectedLocationId },
      setSelectedLocationId,
    }),
}));

vi.mock('@/entities/device', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/device')>();
  return {
    ...actual,
    useActivateDevice: vi.fn(() => ({
      isPending: false,
      mutateAsync: activateMutateAsync,
    })),
    useConfigureDevice: vi.fn(() => ({
      isPending: true,
      mutateAsync: configureMutateAsync,
    })),
    useDeactivateDevice: vi.fn(() => ({
      isPending: false,
      mutateAsync: deactivateMutateAsync,
    })),
  };
});

describe('useDeviceActions', () => {
  beforeEach(() => {
    activateMutateAsync.mockReset();
    configureMutateAsync.mockReset();
    deactivateMutateAsync.mockReset();
    setSelectedLocationId.mockReset();
    toasterError.mockReset();
    selectedLocationId = 'loc-1';
  });

  it('syncs selected location and forwards payloads to mutations', async () => {
    activateMutateAsync.mockResolvedValue({ id: 'dev-1' });
    configureMutateAsync.mockResolvedValue({ id: 'dev-1' });

    const actions = useDeviceActions({ accountId: 'acc-1' });

    await actions.activateDevice(
      {
        deviceId: 'dev-1',
        locationId: 'loc-2',
      },
      {
        locationId: 'loc-2',
        targetMode: DeviceModeEnum.SINGLE,
        singleLinkUrl: 'https://example.com',
      },
    );

    await actions.configureDevice(
      {
        deviceId: 'dev-1',
        locationId: 'loc-2',
      },
      {
        locale: '',
        mode: DeviceModeEnum.MULTI,
        name: '',
        singleLinkUrl: '',
        type: '',
      },
    );

    expect(setSelectedLocationId).toHaveBeenCalledWith('acc-1', 'loc-2');
    expect(activateMutateAsync).toHaveBeenCalledWith({
      id: 'dev-1',
      input: {
        locationId: 'loc-2',
        targetMode: DeviceModeEnum.SINGLE,
        singleLinkUrl: 'https://example.com',
      },
      previousLocationId: 'loc-1',
    });
    expect(configureMutateAsync).toHaveBeenCalledWith({
      id: 'dev-1',
      input: {
        locationId: 'loc-2',
        targetMode: DeviceModeEnum.MULTI,
        name: null,
        singleLinkUrl: null,
      },
      previousLocationId: 'loc-1',
    });
    expect(actions.isConfigurePending).toBe(true);
  });

  it('uses selected location by default and forwards deactivate payload', async () => {
    deactivateMutateAsync.mockResolvedValue({ id: 'dev-1' });

    const actions = useDeviceActions({ accountId: 'acc-1' });

    await actions.deactivateDevice({ deviceId: 'dev-1' });

    expect(setSelectedLocationId).not.toHaveBeenCalled();
    expect(deactivateMutateAsync).toHaveBeenCalledWith({
      id: 'dev-1',
      previousLocationId: 'loc-1',
    });
  });

  it('throws when activate/configure have no location context', async () => {
    selectedLocationId = null;
    const actions = useDeviceActions({ accountId: 'acc-1' });

    await expect(
      actions.activateDevice(
        {
          deviceId: 'dev-1',
        },
        {
          locationId: '',
          targetMode: DeviceModeEnum.MULTI,
        },
      ),
    ).rejects.toThrow('Device location is required');
  });
});
