import { useState } from 'react';
import { getDeviceName, useActivateDevice } from '@/entities/device';
import type { ActivateSingleDevicePayload, ActivateMultiDevicePayload } from '@/entities/device';
import { parseErrorMessage } from '@/shared/api';
import { useRouter } from 'next/router';
import { UseFormReturn } from 'react-hook-form';
import { OnboardingFormValues } from '../model/types';
import { useTranslation } from 'react-i18next';
import {
  type OnboardMultiDevicePayload,
  type OnboardSingleDevicePayload,
  useHasActiveSession,
  useOnboardDevice,
} from '@/entities/auth';
import { ContactPlatform, DeviceModeEnum, PlatformLink } from '@/shared/lib';
import {
  locationSelectionSelectors,
  useCreateLocation,
  type CreateLocationDtoRequest,
} from '@/entities/location';
import { useUiStore } from '@/shared/store';

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

  const shortCode = typeof router.query.id === 'string' ? router.query.id : undefined;

  const [isEmailConflict, setIsEmailConflict] = useState(false);

  const { mutateAsync: onboardDevice, isPending: isOnboarding } = useOnboardDevice();
  const createLocationMutation = useCreateLocation({ scope: { accountId } });
  const { mutateAsync: activateDevice, isPending: isActivating } = useActivateDevice(
    shortCode ?? '',
  );

  const isSubmitting = isActivating || isOnboarding || createLocationMutation.isPending;

  const onSubmit = async () => {
    const formData = methods.getValues();
    const { googleLocation, device, mode, user, links, isNewLocation } = formData;

    if (!links?.length && isNewLocation) return;

    const prepLinks: PlatformLink[] = links
      .filter((l) => l.type && l.url)
      .map((l) => ({ type: l.type as ContactPlatform, url: l.url }));

    const locationPayload: CreateLocationDtoRequest = {
      ...googleLocation?.location,
      name: googleLocation?.location?.name || t('addDevice.location.defaultName'),
      address: googleLocation?.location?.address || t('addDevice.location.defaultAddress'),
      pageConfig: {
        links: JSON.stringify(prepLinks),
      },
    };

    try {
      if (isAuth) {
        const locationId = isNewLocation
          ? (await createLocationMutation.mutateAsync(locationPayload)).id
          : currentLocationId;

        const activateDevicePayload =
          mode === DeviceModeEnum.SINGLE
            ? ({
                locationId,
                targetMode: mode,
                singleLinkUrl: formData.singleLinkUrl || links?.[0]?.url,
              } as ActivateSingleDevicePayload)
            : ({ locationId, targetMode: mode } as ActivateMultiDevicePayload);

        await activateDevice({
          id: device.id,
          payload: activateDevicePayload,
        });
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
          location: locationPayload,
          device: onboardingDevicePayload,
          deviceName,
        });
      }

      onComplete();
    } catch (err) {
      const parsedErr = parseErrorMessage(err);
      if (parsedErr === 'Email already in use') {
        setIsEmailConflict(true);
      }
    }
  };

  return { onSubmit, isSubmitting, isEmailConflict };
};
