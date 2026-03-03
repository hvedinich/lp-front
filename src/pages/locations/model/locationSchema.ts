import { z } from 'zod';
import type { TFunction } from 'i18next';

export interface LocationFormValues {
  name: string;
  phone: string;
  website: string;
  address: string;
  timeZone: string;
  publicSlug: string;
  isDefault: boolean;
}

export const createLocationSchema = (t: TFunction<'common'>) =>
  z.object({
    address: z.string().trim().max(300).optional().default(''),
    isDefault: z.boolean().optional().default(false),
    name: z
      .string()
      .trim()
      .min(2, t('workspace.locationsForm.validation.nameMin'))
      .max(120, t('workspace.locationsForm.validation.nameMax')),
    phone: z.string().trim().max(40).optional().default(''),
    publicSlug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]*$/, t('workspace.locationsForm.validation.publicSlugPattern'))
      .max(120)
      .optional()
      .default(''),
    timeZone: z.string().trim().max(100).optional().default(''),
    website: z.string().trim().max(200).optional().default(''),
  });
