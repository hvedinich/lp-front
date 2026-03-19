import { Button, Card, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Device } from '@/entities/device';
import { DeviceModeEnum } from '@/entities/device';
import { useDeviceActions } from '@/features/device-actions';
import type { DeviceFormValues } from '@/features/device-actions';
import { Form, Modal, PlatformCardsList, SelectOptionCard, toaster } from '@/shared/ui';
import { useZodForm } from '@/shared/lib';
import { REVIEW_PLATFORMS } from '@/shared/config';
import { resolvePlatformFromUrl } from '../lib/resolvePlatformFromUrl';
import type { ContactPlatform } from '@/entities/hostedPage';

// import PlatformInput from '@/pages/addDevice/ui/PlatformInput';

interface DeviceSettingsTabProps {
  device: Device;
  accountId: string;
}

const schema = z.object({
  mode: z.nativeEnum(DeviceModeEnum),
  singleLinkUrl: z.string(),
});

type SettingsFormValues = z.infer<typeof schema>;

export function DeviceSettingsTab({ device, accountId }: DeviceSettingsTabProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const initialPlatform = device.targetUrl
    ? (resolvePlatformFromUrl(device.targetUrl)?.platform ?? null)
    : null;
  const [selectedPlatform, setSelectedPlatform] = useState<ContactPlatform | null>(initialPlatform);

  const actions = useDeviceActions({ accountId });

  const methods = useZodForm<SettingsFormValues>({
    schema,
    defaultValues: {
      mode: device.mode ?? DeviceModeEnum.SINGLE,
      singleLinkUrl: device.targetUrl ?? '',
    },
  });

  const { control, setValue, watch, handleSubmit } = methods;

  const currentMode = watch('mode');

  const modes = [
    {
      value: DeviceModeEnum.SINGLE,
      title: t('workspace.devicePage.settings.singleModeTitle'),
      description: t('workspace.devicePage.settings.singleModeDescription'),
    },
    {
      value: DeviceModeEnum.MULTI,
      title: t('workspace.devicePage.settings.multiModeTitle'),
      description: t('workspace.devicePage.settings.multiModeDescription'),
    },
  ];

  const infoText =
    currentMode === DeviceModeEnum.SINGLE
      ? t('workspace.devicePage.settings.singleModeInfo')
      : t('workspace.devicePage.settings.multiModeInfo');

  const onSubmit = async (formValues: SettingsFormValues) => {
    const values: DeviceFormValues = {
      locale: device.locale ?? '',
      mode: formValues.mode,
      name: device.name ?? '',
      singleLinkUrl: formValues.singleLinkUrl,
      type: device.type ?? '',
    };
    try {
      await actions.configureDevice({ deviceId: device.id, locationId: device.locationId }, values);
      toaster.success({ description: t('commonFeedback.saved') });
    } catch {
      // errors toasted by useDeviceActions internally
    }
  };

  const handleDelete = async () => {
    try {
      await actions.deactivateDevice({ deviceId: device.id, locationId: device.locationId });
      void router.push('/devices');
    } catch {
      // errors toasted internally
    }
  };

  // const PlatformIcon = selectedPlatform ? PLATFORM_ICON[selectedPlatform] : null;

  return (
    <Form
      methods={methods}
      onSubmit={() => void handleSubmit(onSubmit)()}
    >
      <Stack gap='6'>
        <Card.Root
          gap='3'
          p='4'
        >
          <Heading size='sm'>{t('workspace.devicePage.settings.modeTitle')}</Heading>
          <Flex
            gap='3'
            direction={{ base: 'column', md: 'row' }}
          >
            {modes.map(({ value, title, description }) => (
              <SelectOptionCard
                key={value}
                isSelected={currentMode === value}
                onSelect={() => setValue('mode', value)}
                title={title}
                minH='full'
                bg='bg'
                description={description}
              />
            ))}
          </Flex>
        </Card.Root>

        {currentMode === DeviceModeEnum.SINGLE && (
          <Card.Root
            gap='3'
            p='4'
          >
            <Heading size='sm'>{t('workspace.devicePage.settings.platformSectionTitle')}</Heading>

            {/* {selectedPlatform && PlatformIcon && (
              <PlatformInput
                // key={field.id}
                // index={index}
                platform={selectedPlatform as ContactPlatform}
                // onRemove={() => remove(index)}
                // onUpdate={(url: string) => update(index, { type: field.type, url })}
              />
            )} */}
            <PlatformCardsList
              platforms={REVIEW_PLATFORMS.filter((platform) => selectedPlatform !== platform)}
              togglePlatform={(platform) => setSelectedPlatform(platform)}
              title={'Select another platform to configure'}
            />

            <Card.Root
              p='3'
              bg='bg'
              variant='subtle'
              alignItems='center'
              flexDir='row'
              gap='2'
            >
              <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <Text fontSize='sm'>{infoText}</Text>
            </Card.Root>
          </Card.Root>
        )}

        {currentMode === DeviceModeEnum.MULTI && (
          <Card.Root
            p='3'
            bg='bg'
            variant='subtle'
            alignItems='center'
            flexDir='row'
            gap='2'
          >
            <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <Text fontSize='sm'>{infoText}</Text>
          </Card.Root>
        )}

        <Flex justify='space-between'>
          <Button
            variant='ghost'
            colorPalette='red'
            size='sm'
            type='button'
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {t('workspace.devicePage.settings.deleteButton')}
          </Button>
          <Button
            type='submit'
            loading={actions.isConfigurePending}
          >
            {t('commonActions.save')}
          </Button>
        </Flex>
      </Stack>

      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={t('workspace.devicePage.settings.deleteConfirmTitle')}
        footer={
          <Flex
            gap='3'
            justify='flex-end'
          >
            <Button
              variant='ghost'
              type='button'
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {t('workspace.devicePage.settings.deleteCancelButton')}
            </Button>
            <Button
              colorPalette='red'
              type='button'
              loading={actions.isDeactivatePending}
              onClick={() => void handleDelete()}
            >
              {t('workspace.devicePage.settings.deleteConfirmButton')}
            </Button>
          </Flex>
        }
      >
        <Text>{t('workspace.devicePage.settings.deleteConfirmDescription')}</Text>
      </Modal>
    </Form>
  );
}
