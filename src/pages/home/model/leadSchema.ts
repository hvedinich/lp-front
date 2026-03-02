import { z } from 'zod';
import type { TFunction } from 'i18next';

export type LeadFormValues = {
  companyName: string;
  contactEmail: string;
  distributionChannel: 'email' | 'sms' | 'qr';
  includeNps: boolean;
  notes?: string;
};

export const createLeadSchema = (t: TFunction) =>
  z.object({
    companyName: z.string().trim().min(2, t('form.validation.companyNameMin')),
    contactEmail: z.email(t('form.validation.contactEmailInvalid')),
    distributionChannel: z.enum(['email', 'sms', 'qr']),
    includeNps: z.boolean(),
    notes: z.string().max(500, t('form.validation.notesMax')).optional(),
  });
