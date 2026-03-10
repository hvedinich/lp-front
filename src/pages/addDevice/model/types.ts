import type { Device } from '@/entities/device';
import { DeviceModeEnum, LocationPayload, PlatformLink } from '@/shared/lib';
import type { AutocompleteOption } from '@/shared/ui';

export type OnboardingStep = 'location' | 'mode' | 'platformLinks' | 'userInfo' | 'success';

export interface UserFormValues {
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
