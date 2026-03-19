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
