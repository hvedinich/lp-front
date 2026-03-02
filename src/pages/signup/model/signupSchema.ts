import { z } from 'zod';
import type { TFunction } from 'i18next';

export const languageCodes = ['en', 'pl', 'ru'] as const;
export const regionCodes = ['us', 'pl', 'ru'] as const;

export const createSignupSchema = (t: TFunction) =>
  z.object({
    email: z.email(t('signup.validation.emailInvalid')),
    password: z.string().min(8, t('signup.validation.passwordMin')),
    name: z.string().trim().min(2, t('signup.validation.nameMin')),
    language: z.enum(languageCodes),
    account: z.object({
      name: z.string().trim().min(2, t('signup.validation.accountNameMin')),
      region: z.enum(regionCodes),
      contentLanguage: z.enum(languageCodes),
    }),
  });
