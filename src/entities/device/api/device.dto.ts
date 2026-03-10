import type { DeviceModeEnum, ListQueryParams } from '@/shared/lib';
import { DeviceStatus } from '../model/types';

export interface DeviceDto {
  id: string;
  shortCode: string;
  locale: string;
  type: string | null;
  connectedAt: string | null;
  status: DeviceStatus;
  mode: DeviceModeEnum | null;
  targetUrl: string | null;
  accountId: string;
  locationId: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DeviceLifecycleDtoRequest {
  locationId: string;
  mode: DeviceModeEnum;
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
