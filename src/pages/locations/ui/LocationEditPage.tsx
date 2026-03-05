import { Alert, Heading, Stack, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useHasActiveSession } from '@/entities/auth';
import { type Location, locationQueryKeys, useLocationById } from '@/entities/location';
import { useLocationActions } from '../model/useLocationActions';
import { resolveLocationEditorState } from '../model/locationEditorState';
import { useLocationQueryErrorToast } from '../model/useLocationQueryErrorToast';
import { LocationEditorForm } from './LocationEditorForm';

const getLocationFromListCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  accountId: string,
  locationId: string,
): Location | undefined => {
  const cachedLists = queryClient.getQueriesData<Location[]>({
    queryKey: locationQueryKeys.lists(accountId),
  });

  for (const [, list] of cachedLists) {
    const fromList = list?.find((item) => item.id === locationId);
    if (fromList) {
      return fromList;
    }
  }

  return undefined;
};

export default function LocationEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const locationId = typeof router.query.id === 'string' ? router.query.id : null;

  const sessionQuery = useHasActiveSession();
  const accountId = sessionQuery.data?.payload?.account.id ?? '';
  const role = sessionQuery.data?.payload?.account.role;
  const canManage = role === 'owner' || role === 'admin';

  const locationQuery = useLocationById({
    scope: {
      accountId,
      id: locationId,
    },
    options: {
      enabled: router.isReady && Boolean(locationId),
      initialData: () => {
        if (!accountId || !locationId) {
          return undefined;
        }

        return getLocationFromListCache(queryClient, accountId, locationId);
      },
    },
  });

  const { updateLocation, isUpdatePending } = useLocationActions({ accountId });
  const editorState = resolveLocationEditorState({
    canManage,
    error: locationQuery.error,
    isLocationPending: locationQuery.isPending,
    isUpdatePending,
    mode: 'edit',
  });

  useLocationQueryErrorToast({ error: locationQuery.error });

  if (editorState.isNotFound) {
    return (
      <Stack
        gap='3'
        maxW='3xl'
        w='full'
      >
        <Heading size='lg'>{t('workspace.locationsPage.notFoundTitle')}</Heading>
        <Text color='fg.muted'>{t('workspace.locationsPage.notFoundDescription')}</Text>
      </Stack>
    );
  }

  const location = locationQuery.data;
  if (!location) {
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
          {canManage
            ? t('workspace.locationsPage.editTitle')
            : t('workspace.locationsPage.viewTitle')}
        </Heading>
        <Text color='fg.muted'>{location.name}</Text>
      </Stack>

      {editorState.isReadonly ? (
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Title>{t('workspace.locationsPage.readonlyDescription')}</Alert.Title>
        </Alert.Root>
      ) : null}

      <LocationEditorForm
        mode='edit'
        location={location}
        canManage={canManage}
        onCancel={() => {
          void router.push('/locations');
        }}
        onUpdate={updateLocation}
        gap='4'
      />
    </Stack>
  );
}
