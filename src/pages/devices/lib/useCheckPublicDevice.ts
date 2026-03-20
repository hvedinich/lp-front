import { useState } from 'react';
import { usePublicDevice } from '@/entities/device';
import { isApiError } from '@/shared/api';
import { useTranslation } from 'react-i18next';

export function useCheckPublicDevice() {
  const { t } = useTranslation('common');
  const [pendingCode, setPendingCode] = useState<string | undefined>(undefined);

  const query = usePublicDevice({
    scope: { shortCode: pendingCode },
    options: { enabled: Boolean(pendingCode) },
  });

  const check = (code: string) => {
    if (pendingCode === code && query.isError) {
      void query.refetch();
    } else {
      setPendingCode(code);
    }
  };

  const message =
    isApiError(query.error) && query.error.status === 404
      ? t('workspace.devicesPage.errors.notFound')
      : t('workspace.devicesPage.errors.generic');

  const isChecking = Boolean(pendingCode) && query.fetchStatus === 'fetching';

  return { query, pendingCode, check, isChecking, message };
}
