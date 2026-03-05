import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocationError } from '@/entities/location';
import { toaster } from '@/shared/ui';
import { resolveLocationToastMessage } from './locationErrorUi';

interface UseLocationQueryErrorToastOptions {
  error: LocationError | null | undefined;
}

export const useLocationQueryErrorToast = ({ error }: UseLocationQueryErrorToastOptions) => {
  const { t } = useTranslation('common');
  const message = resolveLocationToastMessage({ error, t });

  useEffect(() => {
    if (!message) {
      return;
    }

    toaster.error({ description: message });
  }, [message]);
};
