import { Box, type StackProps } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Location, UpdateLocationDtoRequest } from '@/entities/location';
import { useZodForm } from '@/shared/lib';
import { Form, FormControls, toaster } from '@/shared/ui';
import {
  locationFormDefaultValues,
  mapLocationToFormValues,
  mapUpdateLocationFormValues,
} from '../model/locationForm';
import { createLocationSchema, type LocationFormValues } from '../model/locationSchema';
import { LocationFormFields } from './LocationFormFields';

type LocationEditorMode = 'create' | 'edit';

interface LocationEditorFormProps extends Omit<StackProps, 'children' | 'onSubmit'> {
  canManage: boolean;
  location?: Location;
  mode: LocationEditorMode;
  onCancel?: () => void;
  onCreate?: (values: LocationFormValues) => Promise<unknown>;
  onUpdate?: (id: string, input: UpdateLocationDtoRequest) => Promise<unknown>;
}

export function LocationEditorForm({
  canManage,
  location,
  mode,
  onCancel,
  onCreate,
  onUpdate,
  ...rest
}: LocationEditorFormProps) {
  const { t } = useTranslation('common');
  const schema = useMemo(() => createLocationSchema(t), [t]);

  const methods = useZodForm<LocationFormValues>({
    schema,
    mode: 'onBlur',
    defaultValues:
      mode === 'create' ? locationFormDefaultValues : mapLocationToFormValues(location!),
    disabled: mode === 'edit' && !canManage,
  });

  const handleSubmit = async (values: LocationFormValues) => {
    if (mode === 'create') {
      if (onCreate) {
        await onCreate(values);
        toaster.success({ description: t('commonFeedback.created') });
      }
      return;
    }

    if (!location || !onUpdate) {
      return;
    }

    await onUpdate(location.id, mapUpdateLocationFormValues(values));
    toaster.success({ description: t('commonFeedback.saved') });
  };

  const shouldShowSubmit = mode === 'create' || canManage;
  const isSubmitDisabled = !methods.formState.isDirty || !methods.formState.isValid;

  return (
    <Form
      methods={methods}
      onSubmit={handleSubmit}
      flex='1'
      overflowY='auto'
      minH='zero'
      {...rest}
    >
      <LocationFormFields />
      <Box flexGrow='1' />
      <FormControls
        sticky
        stickyBottom='zero'
        secondaryAction={
          onCancel
            ? {
                'data-testid': 'location-form-cancel-button',
                label: t('commonActions.cancel'),
                onClick: onCancel,
                type: 'button',
              }
            : undefined
        }
        primaryAction={
          shouldShowSubmit
            ? {
                'data-testid':
                  mode === 'create' ? 'location-form-create-submit' : 'location-form-edit-submit',
                label:
                  mode === 'create' ? t('workspace.locationsPage.create') : t('commonActions.save'),
                disabled: isSubmitDisabled,
                loading: methods.formState.isSubmitting,
              }
            : undefined
        }
      />
    </Form>
  );
}
