import { DeviceModeEnum } from '@/entities/device';
import type { PlatformLink } from '@/entities/hostedPage';

export const DEFAULT_VALUES = {
  googleLocation: {
    location: null,
    fieldData: null,
  },
  links: [{ type: 'google', url: '' } satisfies PlatformLink],
  isNotify: false,
  isConsent: false,
  mode: DeviceModeEnum.SINGLE,
  user: {
    email: '',
    name: '',
    phone: '',
    password: '',
    language: 'en',
  },
};
