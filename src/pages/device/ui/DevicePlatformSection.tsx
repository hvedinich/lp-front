import { Button, Card, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DeviceModeEnum } from '@/entities/device';
import { REVIEW_PLATFORMS, type ContactPlatform } from '@/entities/hostedPage';
import { PlatformCardsList, PlatformInput } from '@/widgets/platform';
import { useFormContext } from 'react-hook-form';

interface DevicePlatformSectionProps {
  multiPlatformsAdded: ContactPlatform[] | undefined;
}

const PLATFORM_TYPE = 'links.0.type';
const MODE = 'device.mode';

export function DevicePlatformSection({ multiPlatformsAdded }: DevicePlatformSectionProps) {
  const { t } = useTranslation('common');
  const { setValue, trigger, watch } = useFormContext();
  const [platformType, currentMode] = watch([PLATFORM_TYPE, MODE]);

  const onPlatformUpdate = (url: string) => {
    if (platformType === 'google') {
      setValue(PLATFORM_TYPE, url, { shouldValidate: true });
    }
    setValue('device.singleLinkUrl', url);
  };

  const onPlatformToggle = (platform: string) => {
    setValue(PLATFORM_TYPE, platform);
    trigger();
  };

  const infoText =
    currentMode === DeviceModeEnum.SINGLE
      ? t('workspace.devicePage.settings.singleModeInfo')
      : t('workspace.devicePage.settings.multiModeInfo');

  return (
    <Stack gap='2'>
      <Flex justify='space-between'>
        <Heading size='sm'>{t('workspace.devicePage.settings.platformSectionTitle')}</Heading>
        {currentMode === DeviceModeEnum.MULTI && (
          <Flex gap='2'>
            <Button
              variant='subtle'
              size='2xs'
            >
              {t('workspace.devicePage.settings.editPageButton')}
            </Button>
            <Button size='2xs'>{t('workspace.devicePage.settings.viewPageButton')}</Button>
          </Flex>
        )}
      </Flex>

      {currentMode === DeviceModeEnum.SINGLE ? (
        <>
          <PlatformInput
            bg='bg'
            index={0}
            platform={platformType}
            onUpdate={onPlatformUpdate}
          />
          <PlatformCardsList
            platforms={REVIEW_PLATFORMS.filter((platform) => platformType !== platform)}
            togglePlatform={onPlatformToggle}
          />
        </>
      ) : (
        <>
          {!!multiPlatformsAdded?.length && <PlatformCardsList platforms={multiPlatformsAdded} />}
        </>
      )}

      <Card.Root
        p='3'
        bg='bg'
        variant='subtle'
        alignItems='center'
        flexDir='row'
        gap='2'
        mt='4'
      >
        <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />
        <Text fontSize='sm'>{infoText}</Text>
      </Card.Root>
    </Stack>
  );
}
