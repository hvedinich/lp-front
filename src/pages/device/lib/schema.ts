import { createLinksSchema, DeviceModeEnum } from '@/entities/device';
import { TFunction } from 'i18next';
import z from 'zod';

export const updateDeviceSchema = (t: TFunction<'common'>) =>
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

export const deviceSettingsFormSchema = (t: TFunction<'common'>) =>
  z
    .object({
      device: updateDeviceSchema(t),
      links: z.array(z.object({ type: z.string(), url: z.string() })),
      googleLocation: z.any().optional(),
    })
    .superRefine((value, ctx) => {
      if (value.device.mode !== DeviceModeEnum.SINGLE) return;

      const result = createLinksSchema(t).safeParse(value.links);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ['links', ...issue.path] });
        });
      }
    });

export type DeviceSettingsFormValues = z.infer<ReturnType<typeof deviceSettingsFormSchema>>;
