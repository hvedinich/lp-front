import { Card } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Device } from '@/entities/device';
import { DeviceModeEnum } from '@/entities/device';
import { useDeviceActions } from '@/features/device-actions';
import type { DeviceFormValues } from '@/features/device-actions';
import { Form, FormControls, toaster } from '@/shared/ui';
import { useZodForm } from '@/shared/lib';
import { useHostedPage } from '@/entities/hostedPage';
import { useGetPlaceDetails } from '@/features/google';
import { resolvePlatformFromUrl } from '../lib/resolvePlatformFromUrl';
import { deviceSettingsFormSchema, DeviceSettingsFormValues } from '../lib/schema';
import { DeviceNameSection } from './DeviceNameSection';
import { DeviceModeSection } from './DeviceModeSection';
import { DevicePlatformSection } from './DevicePlatformSection';

const formId = 'device_form';

interface DeviceSettingsTabProps {
  device: Device;
  accountId: string;
}

export function DeviceSettingsTab({ device, accountId }: DeviceSettingsTabProps) {
  const { t } = useTranslation('common');

  const initialPlatform = device.targetUrl
    ? (resolvePlatformFromUrl(device.targetUrl)?.platform ?? 'google')
    : 'google';

  const { configureDevice, isConfigurePending } = useDeviceActions({ accountId });
  const hostedPageQuery = useHostedPage({ scope: { locationId: device.locationId } });
  const { mutateAsync: getPlaceDetails } = useGetPlaceDetails();

  const methods = useZodForm<DeviceSettingsFormValues>({
    schema: deviceSettingsFormSchema(t),
    defaultValues: {
      links: [
        {
          type: initialPlatform,
          url: device.mode === DeviceModeEnum.SINGLE && device?.targetUrl ? device.targetUrl : '',
        },
      ],
      googleLocation: { fieldData: { label: '', value: '' } },
      device: { ...device, singleLinkUrl: device?.targetUrl || '' },
    },
    mode: 'onChange',
  });

  const { setValue, handleSubmit } = methods;

  useEffect(() => {
    if (initialPlatform !== 'google' || !device.targetUrl) return;
    let placeId: string | null = null;

    try {
      placeId = new URL(device.targetUrl).searchParams.get('placeid');
    } catch {
      return;
    }

    if (!placeId) return;
    void getPlaceDetails({ placeId }).then((details) => {
      if (details) {
        setValue('googleLocation.fieldData.label', details.name);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async ({ device: formDevice }: DeviceSettingsFormValues) => {
    const values: DeviceFormValues = {
      ...device,
      ...formDevice,
      name: formDevice.name,
      singleLinkUrl: formDevice.mode == DeviceModeEnum.MULTI ? '' : formDevice.singleLinkUrl,
    };
    await configureDevice({ deviceId: device?.id, locationId: device?.locationId }, values);
    toaster.success({ description: t('commonFeedback.saved') });
  };

  const multiPlatformsAdded = hostedPageQuery?.data?.publishedConfig?.links?.map(
    ({ type }) => type,
  );

  return (
    <Form
      formId={formId}
      methods={methods}
      onSubmit={async () => handleSubmit(onSubmit)()}
    >
      <Card.Root
        mt='4'
        p='4'
        gap='4'
      >
        <DeviceNameSection control={methods.control} />
        <DeviceModeSection />
        <DevicePlatformSection multiPlatformsAdded={multiPlatformsAdded} />

        <FormControls
          secondaryAction={{
            label: t('commonActions.cancel'),
            onClick: () => methods.reset(),
            type: 'button',
          }}
          primaryAction={{
            label: t('commonActions.save'),
            disabled: !methods.formState.isDirty,
            loading: isConfigurePending,
          }}
        />
      </Card.Root>
    </Form>
  );
}
