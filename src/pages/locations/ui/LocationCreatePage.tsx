import { Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHasActiveSession } from '@/entities/auth';
import { toaster } from '@/shared/ui';
import { useLocationActions } from '../model/useLocationActions';
import type { LocationFormValues } from '../model/locationSchema';
import { LocationEditorForm } from './LocationEditorForm';

export default function LocationCreatePage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const sessionQuery = useHasActiveSession();
  const accountId = sessionQuery.data?.payload?.account.id ?? '';
  const role = sessionQuery.data?.payload?.account.role;
  const canManage = role === 'owner' || role === 'admin';

  const { createLocation } = useLocationActions({ accountId });

  useEffect(() => {
    if (!router.isReady || !accountId || canManage) {
      return;
    }

    toaster.error({ description: t('workspace.locationsPage.errors.forbidden') });
    void router.replace('/locations');
  }, [accountId, canManage, router, router.isReady, t]);

  const submitCreate = async (values: LocationFormValues) => {
    const created = await createLocation(values);
    await router.push(`/locations/${created.id}`);
  };

  if (!canManage) {
    return null;
  }

  return (
    <Stack
      gap='5'
      maxW='3xl'
      w='full'
    >
      <Stack gap='1'>
        <Heading size={{ base: '2xl', md: '4xl' }}>
          {t('workspace.locationsPage.createTitle')}
        </Heading>
        <Text color='fg.muted'>{t('workspace.locationsPage.createDescription')}</Text>
      </Stack>

      <LocationEditorForm
        mode='create'
        canManage={canManage}
        onCreate={submitCreate}
        onCancel={() => {
          void router.push('/locations');
        }}
        gap='4'
      />
    </Stack>
  );
}
