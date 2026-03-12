import { Flex, Stack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PlusIcon, SelectOptionCard } from '@/shared/ui';
import type { OnboardingFormValues } from '../model/types';
import { StepsButtons } from './StepsButtons';
import { BlockHeading } from './BlockHeading';
import { LocationSelector } from '@/features/location-selection';

interface LocationStepProps {
  onNext: () => void;
}

const LocationStep = ({ onNext }: LocationStepProps) => {
  const { t } = useTranslation('common');

  const { setValue, getValues } = useFormContext<OnboardingFormValues>();
  const isNewLocation = getValues('isNewLocation');

  const handleNext = async (isCreatingNew: boolean) => {
    setValue('isNewLocation', isCreatingNew);
    if (!isCreatingNew) {
      setValue('links', []);
    }
    onNext();
  };

  return (
    <Stack gap='7'>
      <BlockHeading
        title={t('addDevice.location.title')}
        description={t('addDevice.location.description')}
      />

      <Flex
        flexDir='column'
        gap='4'
      >
        <SelectOptionCard
          px='4'
          isSelected={!isNewLocation}
          onSelect={() => handleNext(false)}
          overflow='visible'
        >
          <LocationSelector
            size='lg'
            iconSize={24}
            onClick={(e) => e.preventDefault()}
            onLocationSelect={() => handleNext(false)}
            inputProps={{
              layerStyle: 'emptyInput',
            }}
            controlProps={{ insetStart: '2' }}
          />
        </SelectOptionCard>

        <SelectOptionCard
          alignItems='center'
          description={t('addDevice.location.newLocationDescription')}
          flexDir='row'
          gap='4'
          title={t('addDevice.location.newLocationTitle')}
          isSelected={!!isNewLocation}
          onSelect={() => handleNext(true)}
        >
          <Flex
            borderWidth='thin'
            borderColor={isNewLocation ? 'fg.default' : 'fg.muted'}
            borderRadius='full'
          >
            <PlusIcon
              boxSize={5}
              fill={isNewLocation ? 'fg.default' : 'fg.muted'}
            />
          </Flex>
        </SelectOptionCard>
      </Flex>

      <StepsButtons onNext={() => handleNext(!!isNewLocation)} />
    </Stack>
  );
};

export default LocationStep;
