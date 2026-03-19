import { AuthAccountSummary, AuthUserSummary } from '@/entities/auth';
import type { Device, DeviceModeEnum } from '@/entities/device';
import { LocationPayload } from '@/entities/location';
import type { PlatformLink } from '@/entities/hostedPage';
import type { AutocompleteOption } from '@/shared/ui';

interface UserFormValues {
  email: string;
  name: string;
  phone: string;
  password: string;
  language: string;
}

interface GoogleLocation {
  location: LocationPayload | null;
  fieldData?: AutocompleteOption | null;
}

export interface OnboardingFormValues {
  googleLocation?: GoogleLocation;
  isNewLocation: boolean | undefined;
  user: UserFormValues;
  device: Device;
  mode: DeviceModeEnum;
  links: PlatformLink[];
  isNotify: boolean;
  isConsent: boolean;
  singleLinkUrl?: string;
}

export interface DeviceOnboardingResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserSummary;
  account: AuthAccountSummary;
  locationId: string;
  deviceId: string;
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

export interface OnboardPayload {
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

export interface OnboardLocationPayload {
  name: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  timeZone?: string | null;
  publicSlug?: string;
  publishedConfig?: Record<string, unknown>;
}

export interface OnboardLocationResponse {
  location: {
    id: string;
    accountId: string;
    name: string;
    phone: string | null;
    website: string | null;
    address: string | null;
    timeZone: string | null;
    publicSlug: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  };
  hostedPage: {
    id: string;
    accountId: string;
    locationId: string;
    publishedConfig: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
}
