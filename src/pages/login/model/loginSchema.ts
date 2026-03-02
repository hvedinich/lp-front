import { z } from 'zod';
import type { TFunction } from 'i18next';

export const createLoginSchema = (t: TFunction) =>
  z.object({
    email: z.email(t('login.validation.emailInvalid')),
    password: z.string().min(8, t('login.validation.passwordMin')),
  });
