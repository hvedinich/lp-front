import type { ListQueryParams } from '@/shared/lib';
import { AuthAccountSummary, AuthUserSummary } from '@/entities/_contracts';
import { DeviceModeEnum, DeviceStatus } from '../model/types';

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

export interface DeviceLifecycleDtoRequest {
  locationId: string;
  mode: DeviceModeEnum;
  locale?: string | null;
  name?: string | null;
  singleLinkUrl?: string | null;
  type?: string | null;
}

export type DeviceListFilters = {
  locationId?: string;
};

export type GetDevicesParams = ListQueryParams<DeviceListFilters>;

export interface DeviceOnboardingResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserSummary;
  account: AuthAccountSummary;
  locationId: string;
  deviceId: string;
}
