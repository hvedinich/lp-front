import { LocationPayload } from '@/entities/_contracts';

export type DeviceStatus = 'active' | 'disabled' | 'unconfigured';
export interface PublicDevice {
  id: string;
  locale: string;
  status: DeviceStatus;
}

export enum DeviceModeEnum {
  MULTI = 'multilink',
  SINGLE = 'static',
}

export interface Device extends PublicDevice {
  id: string;
  shortCode: string;
  type: string | null;
  connectedAt: Date | null;
  mode: DeviceModeEnum | null;
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

export interface OnboardMultiDevicePayload {
  id: string;
  mode: DeviceModeEnum.MULTI;
}

export interface OnboardSingleDevicePayload {
  id: string;
  mode: DeviceModeEnum.SINGLE;
  targetUrl: string;
}

export interface OnboardDevicePayload {
  email: string;
  name: string;
  phone: string;
  password: string;
  account: {
    name: string;
    region: string;
    contentLanguage: string;
  };
  location: LocationPayload;
  device: OnboardSingleDevicePayload | OnboardMultiDevicePayload;
  deviceName: string;
}
