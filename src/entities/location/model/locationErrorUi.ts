import type { TFunction } from 'i18next';
import { createErrorKeyResolver } from '@/shared/lib';
import { LocationError } from './errors';

interface ResolveLocationToastMessageOptions {
  error: LocationError | null | undefined;
  t: TFunction<'common'>;
}

const resolveLocationErrorKey = createErrorKeyResolver<LocationError['code'], string>({
  fallbackKey: 'workspace.locationsPage.errors.generic',
  keyMap: {
    CONFLICT: 'workspace.locationsPage.errors.conflict',
    FORBIDDEN: 'workspace.locationsPage.errors.forbidden',
    NETWORK: 'workspace.locationsPage.errors.network',
    VALIDATION_ERROR: 'workspace.locationsPage.errors.validation',
  },
});

export const resolveLocationToastMessage = ({
  error,
  t,
}: ResolveLocationToastMessageOptions): string | null => {
  const messageKey = resolveLocationErrorKey(error);

  if (!messageKey) {
    return null;
  }

  return t(messageKey);
};
