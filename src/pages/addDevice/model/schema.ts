import { DeviceModeEnum } from '@/entities/device';
import type { TFunction } from 'i18next';
import { z } from 'zod';

const createUserSchema = (t: TFunction<'common'>) =>
  z.object({
    email: z.email(t('addDevice.validation.emailInvalid')),
    name: z.string().trim().min(2, t('addDevice.validation.nameMin')),
    phone: z.string(),
    password: z.string().min(8, t('addDevice.validation.passwordMin')),
    language: z.string(),
  });

const createLinksSchema = (t: TFunction<'common'>) =>
  z.array(
    z.object({
      type: z.string().min(1, t('addDevice.validation.requiredField')),
      url: z.url(t('addDevice.validation.urlInvalid')),
    }),
  );

export const createAddDeviceSchema = (t: TFunction<'common'>) =>
  z.object({
    googleLocation: z.any().optional(),
    isNewLocation: z.boolean().optional(),
    user: createUserSchema(t),
    device: z.any(),
    mode: z.enum([DeviceModeEnum.MULTI, DeviceModeEnum.SINGLE]),
    links: createLinksSchema(t),
    isNotify: z.boolean(),
    isConsent: z.boolean().refine((val) => val === true, {
      message: t('addDevice.validation.consentRequired'),
    }),

    singleLinkUrl: z.string().optional(),
  });
