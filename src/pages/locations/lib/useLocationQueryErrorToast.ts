import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveLocationToastMessage, type LocationError } from '@/entities/location';
import { toaster } from '@/shared/ui';

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
