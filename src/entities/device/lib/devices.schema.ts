import { DeviceModeEnum } from '@/shared/lib';
import type { TFunction } from 'i18next';
import { z } from 'zod';

export const createDeviceSchema = (t: TFunction<'common'>) =>
  z
    .object({
      locale: z
        .string()
        .trim()
        .max(20, t('workspace.devicesForm.validation.localeMax'))
        .optional()
        .default(''),
      mode: z.enum(DeviceModeEnum, {
        error: () => t('workspace.devicesForm.validation.modeRequired'),
      }),
      name: z
        .string()
        .trim()
        .max(120, t('workspace.devicesForm.validation.nameMax'))
        .optional()
        .default(''),
      singleLinkUrl: z
        .string()
        .trim()
        .max(2000, t('workspace.devicesForm.validation.singleLinkUrlMax'))
        .optional()
        .default(''),
      type: z
        .string()
        .trim()
        .max(80, t('workspace.devicesForm.validation.typeMax'))
        .optional()
        .default(''),
    })
    .superRefine((value, context) => {
      if (value.mode === DeviceModeEnum.SINGLE && value.singleLinkUrl.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('workspace.devicesForm.validation.singleLinkUrlRequired'),
          path: ['singleLinkUrl'],
        });
      }
    });
