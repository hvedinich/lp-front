import { Box, Button, ButtonGroup, Code, Heading, Separator, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { appLanguages, setAppLanguage, type AppLanguage } from '@/shared/config';
import { useZodForm } from '@/shared/lib';
import { CheckboxField, Form, InputField, SelectField, TextareaField } from '@/shared/ui';
import { getWorkspaceSection } from '@/widgets/mainLayout';

type LeadFormValues = {
  companyName: string;
  contactEmail: string;
  distributionChannel: 'email' | 'sms' | 'qr';
  includeNps: boolean;
  notes?: string;
};

const getLocale = (value: string | undefined): AppLanguage => {
  if (value && appLanguages.includes(value as AppLanguage)) {
    return value as AppLanguage;
  }

  return 'en';
};

export default function HomePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const [submittedData, setSubmittedData] = useState<LeadFormValues | null>(null);
  const activeSection = getWorkspaceSection(
    typeof router.query.section === 'string' ? router.query.section : undefined,
  );

  const leadSchema = z.object({
    companyName: z.string().trim().min(2, t('form.validation.companyNameMin')),
    contactEmail: z.email(t('form.validation.contactEmailInvalid')),
    distributionChannel: z.enum(['email', 'sms', 'qr']),
    includeNps: z.boolean(),
    notes: z.string().max(500, t('form.validation.notesMax')).optional(),
  });

  const channelOptions = [
    { label: t('form.distributionChannels.email'), value: 'email' },
    { label: t('form.distributionChannels.sms'), value: 'sms' },
    { label: t('form.distributionChannels.qr'), value: 'qr' },
  ] as const;

  const activeLocale = getLocale(i18n.resolvedLanguage ?? i18n.language);
  const availableLocales = appLanguages;

  const handleLocaleChange = (locale: AppLanguage) => {
    void setAppLanguage(locale);
  };

  const methods = useZodForm<LeadFormValues>({
    schema: leadSchema,
    mode: 'onBlur',
    defaultValues: {
      companyName: '',
      contactEmail: '',
      distributionChannel: 'email',
      includeNps: true,
      notes: '',
    },
  });

  const handleSubmit: SubmitHandler<LeadFormValues> = async (values) => {
    setSubmittedData(values);
  };

  return (
    <Stack
      gap='5'
      maxW='3xl'
    >
      <Heading size='4xl'>{t(`workspace.sections.${activeSection}.title`)}</Heading>
      <Text color='fg.muted'>{t(`workspace.sections.${activeSection}.description`)}</Text>

      <Stack gap='3'>
        <Text fontWeight='medium'>{t('app.language')}</Text>
        <ButtonGroup>
          {availableLocales.map((locale) => (
            <Button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              variant={activeLocale === locale ? 'solid' : 'outline'}
            >
              {t(`app.locale.${locale}`)}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>

      {activeSection === 'reviews' ? (
        <>
          <Form
            methods={methods}
            onSubmit={handleSubmit}
          >
            <InputField
              name='companyName'
              label={t('form.companyNameLabel')}
              placeholder={t('form.companyNamePlaceholder')}
              isRequired
            />

            <InputField
              name='contactEmail'
              label={t('form.contactEmailLabel')}
              placeholder={t('form.contactEmailPlaceholder')}
              type='email'
              isRequired
            />

            <SelectField
              name='distributionChannel'
              label={t('form.distributionChannelLabel')}
              options={channelOptions}
              isRequired
            />

            <CheckboxField
              name='includeNps'
              label={t('form.includeNpsLabel')}
              helperText={t('form.includeNpsHelper')}
            />

            <TextareaField
              name='notes'
              label={t('form.notesLabel')}
              placeholder={t('form.notesPlaceholder')}
              rows={4}
              helperText={t('form.optional')}
            />

            <Button
              type='submit'
              loading={methods.formState.isSubmitting}
              width='[fit-content]'
              colorPalette='brand'
            >
              {t('form.saveDraft')}
            </Button>
          </Form>

          <Separator />

          <Stack gap='2'>
            <Text fontWeight='medium'>{t('form.submittedPayloadPreview')}</Text>
            <Code
              display='block'
              p='4'
              whiteSpace='pre-wrap'
            >
              {submittedData ? JSON.stringify(submittedData, null, 2) : t('form.submitToPreview')}
            </Code>
          </Stack>
        </>
      ) : (
        <Box
          borderWidth='thin'
          borderColor='border.muted'
          borderRadius='xl'
          bg='bg.surface'
          p='6'
        >
          <Text>{t(`workspace.sections.${activeSection}.emptyState`)}</Text>
        </Box>
      )}
    </Stack>
  );
}
