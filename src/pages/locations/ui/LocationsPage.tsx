import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHasActiveSession } from '@/entities/auth';
import {
  useCreateLocation,
  useDeleteLocation,
  useLocations,
  useUpdateLocation,
  type Location,
} from '@/entities/location';
import { useZodForm } from '@/shared/lib';
import { AppIcon, Form, FormErrorAlert, Modal } from '@/shared/ui';
import {
  locationFormDefaultValues,
  mapCreateLocationFormValues,
  mapLocationToFormValues,
  mapUpdateLocationFormValues,
} from '../model/locationForm';
import { createLocationSchema, type LocationFormValues } from '../model/locationSchema';
import { LocationFormFields } from './LocationFormFields';
import { LocationsList } from './LocationsList';

export default function LocationsPage() {
  const { t } = useTranslation('common');
  const sessionQuery = useHasActiveSession();
  const accountId = sessionQuery.data?.payload?.account.id ?? '';
  const role = sessionQuery.data?.payload?.account.role;
  const canManage = role === 'owner' || role === 'admin';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const schema = useMemo(() => createLocationSchema(t), [t]);
  const locationsQuery = useLocations(accountId, { sort: 'name' });
  const { mutateAsync: createLocation, error: createError } = useCreateLocation(accountId);
  const { mutateAsync: updateLocation, error: updateError } = useUpdateLocation(accountId);
  const {
    mutateAsync: deleteLocation,
    error: deleteError,
    isPending: isDeletePending,
  } = useDeleteLocation(accountId);

  const createMethods = useZodForm<LocationFormValues>({
    schema,
    mode: 'onBlur',
    defaultValues: locationFormDefaultValues,
  });

  const editMethods = useZodForm<LocationFormValues>({
    schema,
    mode: 'onBlur',
    defaultValues: locationFormDefaultValues,
    disabled: !canManage,
  });

  const onOpenEdit = (location: Location) => {
    setEditingLocation(location);
    editMethods.reset(mapLocationToFormValues(location));
  };

  const handleCreate = async (values: LocationFormValues) => {
    await createLocation(mapCreateLocationFormValues(values));

    setIsCreateOpen(false);
    createMethods.reset();
  };

  const handleUpdate = async (values: LocationFormValues) => {
    if (!editingLocation || !canManage) {
      return;
    }

    await updateLocation({
      id: editingLocation.id,
      input: mapUpdateLocationFormValues(values),
    });

    setEditingLocation(null);
  };

  const handleDelete = async (locationId: string) => {
    await deleteLocation(locationId);
  };

  return (
    <Stack
      gap='5'
      maxW='5xl'
    >
      <Flex
        align='start'
        justify='space-between'
        gap='4'
      >
        <Box>
          <Heading size={{ base: '2xl', md: '4xl' }}>
            {t('workspace.sections.locations.title')}
          </Heading>
          <Text
            color='fg.muted'
            fontSize={{ base: 'sm', md: 'lg' }}
          >
            {t('workspace.sections.locations.description')}
          </Text>
        </Box>

        {canManage ? (
          <Button onClick={() => setIsCreateOpen(true)}>
            <AppIcon
              icon={PlusIcon}
              size={16}
            />
            {t('workspace.locationsPage.create')}
          </Button>
        ) : null}
      </Flex>

      <FormErrorAlert message={locationsQuery.error?.message ?? deleteError?.message ?? null} />

      <LocationsList
        locations={locationsQuery.data ?? []}
        canManage={canManage}
        isDeletePending={isDeletePending}
        onEdit={onOpenEdit}
        onDelete={handleDelete}
      />

      {!locationsQuery.isPending && (locationsQuery.data?.length ?? 0) === 0 ? (
        <Text color='fg.subtle'>{t('workspace.locationsPage.empty')}</Text>
      ) : null}

      <Modal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title={t('workspace.locationsPage.create')}
      >
        <FormErrorAlert message={createError?.message ?? null} />
        <Form
          methods={createMethods}
          onSubmit={handleCreate}
        >
          <LocationFormFields />
          <Button
            type='submit'
            loading={createMethods.formState.isSubmitting}
          >
            {t('workspace.locationsPage.save')}
          </Button>
        </Form>
      </Modal>

      <Modal
        open={Boolean(editingLocation)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLocation(null);
          }
        }}
        title={t('workspace.locationsPage.edit')}
      >
        <FormErrorAlert message={updateError?.message ?? null} />
        <Form
          methods={editMethods}
          onSubmit={handleUpdate}
        >
          <LocationFormFields includeDefaultField />
          <Button
            type='submit'
            disabled={!canManage}
            loading={editMethods.formState.isSubmitting}
          >
            {t('workspace.locationsPage.save')}
          </Button>
        </Form>
      </Modal>
    </Stack>
  );
}
