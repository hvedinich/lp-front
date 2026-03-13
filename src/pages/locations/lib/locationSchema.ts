import { z } from 'zod';
import type { TFunction } from 'i18next';

export const createLocationSchema = (t: TFunction<'common'>) =>
  z.object({
    address: z
      .string()
      .trim()
      .max(300, t('workspace.locationsForm.validation.addressMax'))
      .optional()
      .default(''),
    isDefault: z.boolean().optional().default(false),
    name: z
      .string()
      .trim()
      .min(2, t('workspace.locationsForm.validation.nameMin'))
      .max(120, t('workspace.locationsForm.validation.nameMax')),
    phone: z
      .string()
      .trim()
      .max(40, t('workspace.locationsForm.validation.phoneMax'))
      .optional()
      .default(''),
    publicSlug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]*$/, t('workspace.locationsForm.validation.publicSlugPattern'))
      .max(120, t('workspace.locationsForm.validation.publicSlugMax'))
      .optional()
      .default(''),
    timeZone: z
      .string()
      .trim()
      .max(100, t('workspace.locationsForm.validation.timeZoneMax'))
      .optional()
      .default(''),
    website: z
      .string()
      .trim()
      .max(200, t('workspace.locationsForm.validation.websiteMax'))
      .optional()
      .default(''),
  });
