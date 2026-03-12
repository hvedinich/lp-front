import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { OnboardingFormValues } from '../model/types';
import { PLATFORM_ICON, PLATFORM_URL_PATTERNS } from '../lib/constants';
import { Button, Flex, Text, Card } from '@chakra-ui/react';
import { InputField } from '@/shared/ui';
import { GooglePlacesField } from '@/features/google';
import { getPlatformLabel } from '../lib/helpers';
import { ContactPlatform } from '@/shared/lib';

interface PlatformInputProps {
  index: number;
  platform: ContactPlatform;
  onRemove: () => void;
  onUpdate: (url: string) => void;
}

const PlatformInput = ({ index, platform, onRemove, onUpdate }: PlatformInputProps) => {
  const { t } = useTranslation('common');
  const { control, getValues, setValue } = useFormContext<OnboardingFormValues>();

  const device = getValues('device');

  const PlatformIcon = PLATFORM_ICON[platform];
  const isGoogle = platform === 'google';

  return (
    <Card.Root
      p='5'
      overflow='visible'
    >
      <Flex
        align='center'
        mb='3'
        justify='space-between'
      >
        <Flex
          align='center'
          gap='2'
        >
          <PlatformIcon boxSize={6} />

          <Text
            fontWeight='medium'
            fontSize='sm'
          >
            {getPlatformLabel(platform)}
          </Text>
        </Flex>
        <Button
          size='xs'
          variant='ghost'
          colorPalette='red'
          onClick={onRemove}
        >
          {t('commonActions.delete')}
        </Button>
      </Flex>

      {isGoogle ? (
        <GooglePlacesField
          rules={{ required: t('addDevice.validation.requiredField') }}
          isRequired
          name='googleLocation.fieldData'
          region={device.locale}
          onSelect={(location, placeId) => {
            if (!location || !placeId) return;

            setValue('googleLocation.location', location, {
              shouldValidate: true,
            });
            onUpdate(`https://search.google.com/local/writereview?placeid=${placeId}`);
          }}
        />
      ) : (
        <InputField
          name={`links.${index}.url`}
          control={control}
          placeholder={t('addDevice.platformLinks.urlPlaceholder')}
          type='url'
          onBlur={(e) => onUpdate(e.target.value || '')}
          rules={{
            validate: (value: string) => {
              if (!value) return t('addDevice.validation.urlInvalid');
              if (!/^https?:\/\/.+/.test(value)) return t('addDevice.validation.urlInvalid');
              const pattern = PLATFORM_URL_PATTERNS[platform];
              if (pattern) {
                try {
                  const { hostname } = new URL(value);
                  if (!pattern.test(hostname)) {
                    return t('addDevice.validation.urlPlatformInvalid', {
                      platform: getPlatformLabel(platform),
                    });
                  }
                } catch {
                  return t('addDevice.validation.urlInvalid');
                }
              }
              return true;
            },
          }}
        />
      )}
    </Card.Root>
  );
};

export default PlatformInput;
