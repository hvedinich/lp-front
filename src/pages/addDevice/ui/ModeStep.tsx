import { Flex, Stack } from '@chakra-ui/react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { OnboardingFormValues } from '@/features/onboarding';
import { SelectOptionCard } from '@/shared/ui';
import { StepsButtons } from './StepsButtons';
import { BlockHeading } from './BlockHeading';
import { DeviceModeEnum } from '@/entities/device';

interface ModeStepProps {
  onNext: () => void;
  onBack?: () => void;
}

const ModeStep = ({ onNext, onBack }: ModeStepProps) => {
  const { t } = useTranslation('common');
  const { control, trigger } = useFormContext<OnboardingFormValues>();

  const { field } = useController({
    name: 'mode',
    control,
  });

  const handleNext = async (value?: string) => {
    field.onChange(value);
    const valid = await trigger('mode');

    if (valid) {
      onNext();
    }
  };

  const modes = [
    {
      value: DeviceModeEnum.SINGLE,
      title: t('addDevice.mode.singleTitle'),
      description: t('addDevice.mode.singleDescription'),
      subDescription: t('addDevice.mode.singleSubDescription'),
    },
    {
      value: DeviceModeEnum.MULTI,
      title: t('addDevice.mode.multiTitle'),
      description: t('addDevice.mode.multiDescription'),
      subDescription: t('addDevice.mode.multiSubDescription'),
    },
  ];

  return (
    <Stack gap='7'>
      <BlockHeading
        title={t('addDevice.mode.title')}
        description={t('addDevice.mode.description')}
      />

      <Flex
        gap='4'
        direction='column'
      >
        {modes.map(({ value, title, description, subDescription }) => {
          const isSelected = field.value === value;

          return (
            <SelectOptionCard
              key={value}
              onSelect={() => handleNext(value)}
              isSelected={isSelected}
              title={title}
              description={description}
              subDescription={subDescription}
            />
          );
        })}
      </Flex>

      <StepsButtons
        onNext={() => handleNext(field.value)}
        isDisabled={!field.value}
        onBack={onBack}
      />
    </Stack>
  );
};

export default ModeStep;
