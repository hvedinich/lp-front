import type { ListQueryParams } from '@/shared/lib';

export type DeviceMode = 'static' | 'multilink';

export interface DeviceDto {
  id: string;
  shortCode: string;
  locale: string | null;
  type: string | null;
  connectedAt: string | null;
  status: string;
  mode: DeviceMode | null;
  targetUrl: string | null;
  accountId: string;
  locationId: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DeviceLifecycleDtoRequest {
  locationId: string;
  mode: DeviceMode;
  locale?: string | null;
  name?: string | null;
  singleLinkUrl?: string | null;
  type?: string | null;
}

export type ActivateDeviceDtoRequest = DeviceLifecycleDtoRequest;

export type ConfigureDeviceDtoRequest = DeviceLifecycleDtoRequest;

export type DeviceListFilters = {
  locationId?: string;
};

export type GetDevicesParams = ListQueryParams<DeviceListFilters>;
