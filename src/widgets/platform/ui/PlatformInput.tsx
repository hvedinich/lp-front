import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Text, Card, CardRootProps } from '@chakra-ui/react';
import { InputField } from '@/shared/ui';
import { GooglePlacesField } from '@/features/google';
import { PLATFORM_ICON, type ContactPlatform } from '@/entities/hostedPage';
import { getPlatformLabel } from '@/entities/device';

interface PlatformInputProps extends CardRootProps {
  index: number;
  platform: ContactPlatform;
  onRemove?: () => void;
  onUpdate: (url: string) => void;
}

const PlatformInput = ({ index, platform, onRemove, onUpdate, ...rest }: PlatformInputProps) => {
  const { t } = useTranslation('common');
  const { control, getValues, setValue } = useFormContext();

  const device = getValues('device');

  const PlatformIcon = PLATFORM_ICON[platform];
  const isGoogle = platform === 'google';

  return (
    <Card.Root
      p='5'
      overflow='visible'
      {...rest}
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
        {onRemove && (
          <Button
            size='xs'
            variant='ghost'
            colorPalette='red'
            onClick={onRemove}
          >
            {t('commonActions.delete')}
          </Button>
        )}
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
        />
      )}
    </Card.Root>
  );
};

export default PlatformInput;
