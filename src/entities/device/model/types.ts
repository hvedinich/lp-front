import type { DeviceMode } from '../api/device.dto';
import { DeviceModeEnum } from '@/shared/lib';

type DeviceStatus = 'active' | 'disabled' | 'unconfigured';
export interface PublicDevice {
  id: string;
  locale: string;
  status: DeviceStatus;
}

export interface Device extends PublicDevice {
  id: string;
  shortCode: string;
  type: string | null;
  connectedAt: Date | null;
  mode: DeviceMode | null;
  targetUrl: string | null;
  accountId: string;
  locationId: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DeviceType =
  | 'CARD_DARK'
  | 'STAND_DARK'
  | 'STAND_DARK_GLOSS'
  | 'STICKER_DARK'
  | 'PLATE_DARK'
  | 'CARD_WHITE'
  | 'STAND_WHITE'
  | 'STICKER_WHITE'
  | 'PLATE_WHITE';

export interface ActivateMultiDevicePayload {
  locationId: string;
  targetMode: DeviceModeEnum.MULTI;
}

export interface ActivateSingleDevicePayload {
  locationId: string;
  targetMode: DeviceModeEnum.SINGLE;
  singleLinkUrl: string;
}

export interface ActivateDevicePayload {
  id: string;
  payload: ActivateMultiDevicePayload | ActivateSingleDevicePayload;
}
