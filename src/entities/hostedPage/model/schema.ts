import type { TFunction } from 'i18next';
import { z } from 'zod';
import { ContactPlatform } from '@/entities/_contracts';
import { getPlatformLabel } from '../lib/helpers';
import { PLATFORM_URL_PATTERNS } from '../lib/constants';

export const createLinksSchema = (t: TFunction<'common'>) =>
  z.array(
    z
      .object({
        type: z.string().min(1, t('addDevice.validation.requiredField')),
        url: z.url(t('addDevice.validation.urlInvalid')),
      })
      .superRefine(({ type, url }, ctx) => {
        const pattern = PLATFORM_URL_PATTERNS[type as ContactPlatform];
        if (pattern && url) {
          try {
            const { hostname } = new URL(url);
            if (!pattern.test(hostname)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('addDevice.validation.urlPlatformInvalid', {
                  platform: getPlatformLabel(type as ContactPlatform),
                }),
                path: ['url'],
              });
            }
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('addDevice.validation.urlInvalid'),
              path: ['url'],
            });
          }
        }
      }),
  );
