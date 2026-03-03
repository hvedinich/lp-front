import { useTranslation } from 'react-i18next';
import { CheckboxField, InputField, TextareaField } from '@/shared/ui';

interface LocationFormFieldsProps {
  includeDefaultField?: boolean;
}

export function LocationFormFields({ includeDefaultField = false }: LocationFormFieldsProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <InputField
        name='name'
        label={t('workspace.locationsForm.nameLabel')}
        isRequired
      />
      <InputField
        name='phone'
        label={t('workspace.locationsForm.phoneLabel')}
      />
      <InputField
        name='website'
        label={t('workspace.locationsForm.websiteLabel')}
      />
      <TextareaField
        name='address'
        label={t('workspace.locationsForm.addressLabel')}
      />
      <InputField
        name='timeZone'
        label={t('workspace.locationsForm.timeZoneLabel')}
      />
      <InputField
        name='publicSlug'
        label={t('workspace.locationsForm.publicSlugLabel')}
      />
      {includeDefaultField ? (
        <CheckboxField
          name='isDefault'
          label={t('workspace.locationsForm.defaultLabel')}
        />
      ) : null}
    </>
  );
}
