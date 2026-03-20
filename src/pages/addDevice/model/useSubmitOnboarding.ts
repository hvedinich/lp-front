import { useState } from 'react';
import {
  type ActivateSingleDevicePayload,
  type ActivateMultiDevicePayload,
  DeviceModeEnum,
  useOnboardDevice,
  OnboardMultiDevicePayload,
  OnboardSingleDevicePayload,
} from '@/entities/device';
import { useRouter } from 'next/router';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useHasActiveSession } from '@/entities/auth';
import type { ContactPlatform, PlatformLink } from '@/entities/hostedPage';
import { locationSelectionSelectors, useOnboardLocation } from '@/entities/location';
import { useDeviceActions } from '@/features/device-actions';
import { useUiStore } from '@/shared/store';
import { getDeviceName } from '../lib/helpers';
import { OnboardingFormValues } from './types';

export const useSubmitOnboarding = ({
  methods,
  isAuth,
  onComplete,
}: {
  methods: UseFormReturn<OnboardingFormValues>;
  isAuth: boolean;
  onComplete: () => void;
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const sessionQuery = useHasActiveSession({ options: { enabled: router.isReady } });
  const accountId = sessionQuery.data?.payload?.account.id ?? '';
  const currentLocationId = useUiStore(locationSelectionSelectors.selectedLocationId(accountId));

  const [isEmailConflict, setIsEmailConflict] = useState(false);

  const { mutateAsync: onboardDevice, isPending: isOnboarding } = useOnboardDevice({
    options: {
      onError: (err) => {
        if (err.code === 'CONFLICT') {
          setIsEmailConflict(true);
        }
      },
    },
    scope: {},
  });
  const { mutateAsync: onboardLocation, isPending: pendingOnboardLocation } = useOnboardLocation({
    scope: { accountId },
  });

  const { activateDevice, isActivatePending } = useDeviceActions({ accountId });

  const isSubmitting = isActivatePending || isOnboarding || pendingOnboardLocation;

  const onSubmit = async () => {
    const formData = methods.getValues();
    const { googleLocation, device, mode, user, links, isNewLocation } = formData;

    if (!links?.length && isNewLocation) return;

    const prepLinks: PlatformLink[] = links
      .filter((l) => l.type && l.url)
      .map((l) => ({ type: l.type as ContactPlatform, url: l.url }));

    const locationBase = {
      ...googleLocation?.location,
      name: googleLocation?.location?.name || t('addDevice.location.defaultName'),
      address: googleLocation?.location?.address || t('addDevice.location.defaultAddress'),
    };
    const linksConfig = { links: JSON.stringify(prepLinks) };

    if (isAuth) {
      const locationId = isNewLocation
        ? (
            await onboardLocation({
              ...locationBase,
              publishedConfig: linksConfig,
            })
          ).location.id
        : currentLocationId;

      const activateDevicePayload =
        mode === DeviceModeEnum.SINGLE
          ? ({
              locationId,
              targetMode: mode,
              singleLinkUrl: formData.singleLinkUrl || links?.[0]?.url,
            } as ActivateSingleDevicePayload)
          : ({ locationId, targetMode: mode } as ActivateMultiDevicePayload);

      await activateDevice({ deviceId: device.id }, activateDevicePayload);
    } else {
      const deviceName = getDeviceName(links[0]!.type, mode);
      const onboardingDevicePayload =
        mode === DeviceModeEnum.MULTI
          ? ({ id: device.id, mode } as OnboardMultiDevicePayload)
          : ({ id: device.id, mode, targetUrl: links?.[0]?.url } as OnboardSingleDevicePayload);

      await onboardDevice({
        email: user.email,
        name: user.name,
        password: user.password,
        phone: user.phone,
        account: {
          name: user.name,
          region: device.locale,
          contentLanguage: device.locale,
        },
        location: { ...locationBase, pageConfig: linksConfig },
        device: onboardingDevicePayload,
        deviceName,
      });
    }

    onComplete();
  };

  return { onSubmit, isSubmitting, isEmailConflict };
};
