import { useTranslation } from 'react-i18next';
import { InputField, TextareaField } from '@/shared/ui';

export function LocationFormFields() {
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
    </>
  );
}
