import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { DeviceError } from '@/entities/device';
import { toaster } from '@/shared/ui';
import { resolveDeviceToastMessage } from './deviceErrorUi';

interface UseDeviceQueryErrorToastOptions {
  error: DeviceError | null | undefined;
}

export const useDeviceQueryErrorToast = ({ error }: UseDeviceQueryErrorToastOptions) => {
  const { t } = useTranslation('common');
  const message = resolveDeviceToastMessage({ error, t });

  useEffect(() => {
    if (!message) {
      return;
    }

    toaster.error({ description: message });
  }, [message]);
};
