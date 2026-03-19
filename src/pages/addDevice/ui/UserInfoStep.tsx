import { Stack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CheckboxField, InputField, PhoneField } from '@/shared/ui';
import type { OnboardingFormValues } from '@/features/onboarding';
import { StepsButtons } from './StepsButtons';
import { BlockHeading } from './BlockHeading';
import UserAgreementField from './UserAgreementField';

interface UserInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const UserInfoStep = ({ onNext, onBack, isSubmitting }: UserInfoStepProps) => {
  const { t } = useTranslation('common');
  const {
    control,
    trigger,
    formState: { isValid },
  } = useFormContext<OnboardingFormValues>();

  const handleNext = async () => {
    const valid = await trigger(['user.email', 'user.name', 'user.password', 'isConsent']);

    if (valid) {
      onNext();
    }
  };

  return (
    <Stack gap='6'>
      <BlockHeading
        title={t('addDevice.userInfo.title')}
        description={t('addDevice.userInfo.description')}
      />

      <Stack gap='4'>
        <InputField
          name='user.name'
          control={control}
          label={t('addDevice.userInfo.nameLabel')}
          placeholder={t('addDevice.userInfo.namePlaceholder')}
          rules={{
            required: t('addDevice.validation.nameMin'),
            minLength: { value: 2, message: t('addDevice.validation.nameMin') },
          }}
          isRequired
        />

        <InputField
          name='user.email'
          control={control}
          label={t('addDevice.userInfo.emailLabel')}
          placeholder={t('addDevice.userInfo.emailPlaceholder')}
          type='email'
          rules={{
            required: t('addDevice.validation.emailInvalid'),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('addDevice.validation.emailInvalid'),
            },
          }}
          helperText={t('addDevice.userInfo.emailHelperText')}
          isRequired
        />

        <PhoneField
          name='user.phone'
          control={control}
          label={t('addDevice.userInfo.phoneLabel')}
          defaultCountry='pl'
          helperText={t('addDevice.userInfo.phoneHelperText')}
        />

        <InputField
          name='user.password'
          control={control}
          label={t('addDevice.userInfo.passwordLabel')}
          placeholder={t('addDevice.userInfo.passwordPlaceholder')}
          type='password'
          rules={{
            required: t('addDevice.validation.passwordMin'),
            minLength: { value: 8, message: t('addDevice.validation.passwordMin') },
          }}
          isRequired
        />
        <CheckboxField
          label={t('addDevice.userInfo.notifyLabel')}
          name='isNotify'
        />
        <UserAgreementField />
      </Stack>

      <StepsButtons
        isDisabled={!isValid}
        onNext={handleNext}
        onBack={onBack}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
};

export default UserInfoStep;
