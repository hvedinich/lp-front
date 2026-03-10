import { useState } from 'react';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import { AuthPageLayout } from '@/widgets/authLayout';
import { useSubmitOnboarding } from '../lib/useSubmitOnboarding';
import { buildLoginRedirect } from '@/shared/config';
import type { OnboardingFormValues, OnboardingStep } from '../model/types';
import { EmailConflictNotification } from './EmailConflictNotification';
import LocationStep from './LocationStep';
import ModeStep from './ModeStep';
import PlatformLinksStep from './PlatformLinksStep';
import UserInfoStep from './UserInfoStep';
import SuccessStep from './SuccessStep';

const AUTH_STEPS: OnboardingStep[] = ['location', 'mode', 'platformLinks', 'success'];
const NEW_USER_STEPS: OnboardingStep[] = ['mode', 'platformLinks', 'userInfo', 'success'];

interface AddDevicePageContentProps {
  defaultValues: OnboardingFormValues;
  isAuth: boolean;
}

export default function AddDevicePageContent({ defaultValues, isAuth }: AddDevicePageContentProps) {
  const router = useRouter();

  const shortCode = router.query.id;
  const isSuccess = router.query.success === 'true';
  const steps = isAuth ? AUTH_STEPS : NEW_USER_STEPS;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  const methods = useForm<OnboardingFormValues>({
    defaultValues,
    mode: 'onBlur',
  });

  const onComplete = async () => {
    const updatedUrl = `add-device?id=${shortCode}&success=true`;
    await router.replace(updatedUrl);
    setCurrentStepIndex(steps.indexOf('success'));
  };

  const { onSubmit, isSubmitting, isEmailConflict } = useSubmitOnboarding({
    methods,
    isAuth,
    onComplete,
  });

  const handleNext = () => {
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStepIndex((prev) => prev - 1);
  };

  const isLastFormStep = steps[currentStepIndex + 1] === 'success';

  const handleStepNext = () => {
    if (isLastFormStep) {
      void onSubmit();
    } else {
      handleNext();
    }
  };

  if (isEmailConflict) {
    const loginUrl = buildLoginRedirect(`/add-device?id=${shortCode}`) ?? '/login';

    return (
      <AuthPageLayout childrenProps={{ width: '2xl' }}>
        <EmailConflictNotification loginUrl={loginUrl} />
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout
      p={{ base: undefined, md: '6' }}
      py='6'
      childrenProps={{
        borderRadius: { base: 'none', md: '2xl' },
        width: { base: 'full', md: '2xl' },
        flexGrow: 1,
      }}
    >
      {!isSuccess ? (
        <FormProvider {...methods}>
          {currentStep === 'location' && <LocationStep onNext={handleNext} />}

          {currentStep === 'mode' && (
            <ModeStep
              onNext={handleStepNext}
              onBack={currentStepIndex > 0 ? handleBack : undefined}
            />
          )}

          {currentStep === 'platformLinks' && (
            <PlatformLinksStep
              onNext={handleStepNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'userInfo' && (
            <UserInfoStep
              onNext={handleStepNext}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </FormProvider>
      ) : (
        <SuccessStep deviceId={defaultValues.device.id} />
      )}
    </AuthPageLayout>
  );
}
