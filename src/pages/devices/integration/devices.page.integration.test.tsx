import { ChakraProvider } from '@chakra-ui/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Device, DeviceModeEnum } from '@/entities/device';
import { system } from '@/shared/config';
import DevicesPage from '../ui/DevicesPage';

const { push, useDeviceQueryErrorToast, useDevices, useLocationSelection } = vi.hoisted(() => ({
  push: vi.fn(),
  useDevices: vi.fn(),
  useLocationSelection: vi.fn(),
  useDeviceQueryErrorToast: vi.fn(),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();

  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock('@/entities/device', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/device')>();
  return {
    ...actual,
    useDevices,
  };
});

vi.mock('@/features/location-selection', () => ({
  useLocationSelection,
}));

vi.mock('../lib/useDeviceQueryErrorToast', () => ({
  useDeviceQueryErrorToast,
}));

const createDevice = (id: string): Device => ({
  id,
  accountId: 'acc-1',
  connectedAt: new Date('2026-03-01T10:00:00.000Z'),
  createdAt: new Date('2026-03-01T10:00:00.000Z'),
  locale: 'en',
  locationId: 'loc-1',
  mode: DeviceModeEnum.SINGLE,
  name: 'Lobby Tablet',
  shortCode: `SHORT-${id}`,
  status: 'active',
  targetUrl: 'https://example.com',
  type: 'tablet',
  updatedAt: new Date('2026-03-02T10:00:00.000Z'),
});

const renderPage = () =>
  renderToStaticMarkup(
    <ChakraProvider value={system}>
      <DevicesPage />
    </ChakraProvider>,
  );

describe('devices page integration', () => {
  beforeEach(() => {
    push.mockReset();
    useDevices.mockReset();
    useLocationSelection.mockReset();
    useDeviceQueryErrorToast.mockReset();
  });

  it('renders location-required empty state when no location is selected', () => {
    useLocationSelection.mockReturnValue({
      accountId: 'acc-1',
      isHydrated: true,
      isSessionPending: false,
      selectedLocationId: null,
    });
    useDevices.mockReturnValue({
      data: undefined,
      error: null,
      isPending: false,
    });

    const html = renderPage();

    expect(useDevices).toHaveBeenCalledWith({
      options: {
        enabled: false,
      },
      scope: {
        accountId: 'acc-1',
        locationId: null,
      },
    });
    expect(html).toContain('data-testid="devices-location-required"');
    expect(html).toContain('workspace.devicesPage.locationRequiredTitle');
    expect(html).not.toContain('data-testid="devices-list"');
  });

  it('renders empty state for selected location with no devices', () => {
    useLocationSelection.mockReturnValue({
      accountId: 'acc-1',
      isHydrated: true,
      isSessionPending: false,
      selectedLocationId: 'loc-1',
    });
    useDevices.mockReturnValue({
      data: [],
      error: null,
      isPending: false,
    });

    const html = renderPage();

    expect(useDevices).toHaveBeenCalledWith({
      options: {
        enabled: true,
      },
      scope: {
        accountId: 'acc-1',
        locationId: 'loc-1',
      },
    });
    expect(html).toContain('data-testid="devices-empty-state"');
    expect(html).toContain('workspace.devicesPage.emptyTitle');
    expect(html).toContain('workspace.devicesPage.selectedLocationDescription');
    expect(html).not.toContain('data-testid="devices-location-required"');
  });

  it('renders devices list for selected location with devices', () => {
    useLocationSelection.mockReturnValue({
      accountId: 'acc-1',
      isHydrated: true,
      isSessionPending: false,
      selectedLocationId: 'loc-1',
    });
    useDevices.mockReturnValue({
      data: [createDevice('dev-1')],
      error: null,
      isPending: false,
    });

    const html = renderPage();

    expect(html).toContain('data-testid="devices-list"');
    expect(html).toContain('data-testid="devices-card-dev-1"');
    expect(html).not.toContain('data-testid="devices-empty-state"');
    expect(html).not.toContain('data-testid="devices-location-required"');
  });
});
