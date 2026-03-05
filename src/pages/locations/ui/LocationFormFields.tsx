import { useTranslation } from 'react-i18next';
import { InputField, TextareaField } from '@/shared/ui';

export function LocationFormFields() {
  const { t } = useTranslation('common');

  return (
    <>
      <InputField
        name='name'
        data-testid='location-form-name-input'
        label={t('workspace.locationsForm.nameLabel')}
        isRequired
      />
      <InputField
        name='phone'
        data-testid='location-form-phone-input'
        label={t('workspace.locationsForm.phoneLabel')}
      />
      <InputField
        name='website'
        data-testid='location-form-website-input'
        label={t('workspace.locationsForm.websiteLabel')}
      />
      <TextareaField
        name='address'
        data-testid='location-form-address-input'
        label={t('workspace.locationsForm.addressLabel')}
      />
      <InputField
        name='timeZone'
        data-testid='location-form-timezone-input'
        label={t('workspace.locationsForm.timeZoneLabel')}
      />
      <InputField
        name='publicSlug'
        data-testid='location-form-public-slug-input'
        label={t('workspace.locationsForm.publicSlugLabel')}
      />
    </>
  );
}
