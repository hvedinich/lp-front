import type { TFunction } from 'i18next';
import { createErrorKeyResolver } from '@/shared/lib';
import { DeviceError } from '@/entities/device';

interface ResolveDeviceToastMessageOptions {
  error: DeviceError | null | undefined;
  t: TFunction<'common'>;
}

const resolveDeviceErrorKey = createErrorKeyResolver<DeviceError['code'], string>({
  fallbackKey: 'workspace.devicesPage.errors.generic',
  keyMap: {
    BAD_REQUEST: 'workspace.devicesPage.errors.invalidDeviceId',
    CONFLICT: 'workspace.devicesPage.errors.conflict',
    FORBIDDEN: 'workspace.devicesPage.errors.forbidden',
    NETWORK: 'workspace.devicesPage.errors.network',
    NOT_FOUND: 'workspace.devicesPage.errors.notFound',
    VALIDATION_ERROR: 'workspace.devicesPage.errors.validation',
  },
});

export const resolveDeviceToastMessage = ({
  error,
  t,
}: ResolveDeviceToastMessageOptions): string | null => {
  const messageKey = resolveDeviceErrorKey(error);

  if (!messageKey) {
    return null;
  }

  return t(messageKey);
};
