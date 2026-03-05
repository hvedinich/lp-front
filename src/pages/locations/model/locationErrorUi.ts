import type { TFunction } from 'i18next';
import type { LocationError } from '@/entities/location';

interface ResolveLocationToastMessageOptions {
  error: LocationError | null | undefined;
  t: TFunction<'common'>;
}

export const resolveLocationToastMessage = ({
  error,
  t,
}: ResolveLocationToastMessageOptions): string | null => {
  if (!error) {
    return null;
  }

  switch (error.code) {
    case 'FORBIDDEN':
      return t('workspace.locationsPage.errors.forbidden');
    case 'NETWORK':
      return t('workspace.locationsPage.errors.network');
    case 'VALIDATION_ERROR':
      return t('workspace.locationsPage.errors.validation');
    case 'CONFLICT':
      return t('workspace.locationsPage.errors.conflict');
    default:
      return t('workspace.locationsPage.errors.generic');
  }
};
