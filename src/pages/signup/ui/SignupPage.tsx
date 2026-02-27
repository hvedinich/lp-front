import { Box, Button, Card, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useRegisterUser, type RegisterPayload, type RegisterUser } from '@/entities/auth';
import { appLanguages, getPreferredLanguage } from '@/shared/config';
import { useZodForm } from '@/shared/lib';
import { Form, InputField, SelectField } from '@/shared/ui';

const languageCodes = ['en', 'pl', 'ru'] as const;
const regionCodes = ['us', 'pl', 'ru'] as const;

export default function SignupPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const {
    mutateAsync: registerUser,
    isPending: isRegisterPending,
    error: registerError,
    reset: resetRegisterError,
  } = useRegisterUser();

  const [registeredUser, setRegisteredUser] = useState<RegisterUser | null>(null);

  const localeFromApp = getPreferredLanguage();

  const signupSchema = z.object({
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

  const languageOptions = appLanguages.map((value) => ({
    value,
    label: t(`app.locale.${value}`),
  }));

  const regionOptions = regionCodes.map((value) => ({
    value,
    label: t(`signup.regions.${value}`),
  }));

  const methods = useZodForm<RegisterPayload>({
    schema: signupSchema,
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      language: localeFromApp,
      account: {
        name: '',
        region: 'us',
        contentLanguage: localeFromApp,
      },
    },
  });

  const handleSubmit: SubmitHandler<RegisterPayload> = async (values) => {
    resetRegisterError();

    try {
      const result = await registerUser(values);
      setRegisteredUser(result.user);
      methods.reset(values);
      await router.replace('/');
    } catch {
      setRegisteredUser(null);
    }
  };

  const requestError = registerError ? registerError.message || t('signup.errorFallback') : null;

  return (
    <Flex
      minH='dvh'
      align='center'
      justify='center'
      p='6'
      bg='bg.gradient.hero'
    >
      <Card.Root
        width='full'
        maxW='xl'
        p={{ base: '6', md: '12' }}
        variant='elevated'
      >
        <Stack gap='6'>
          <Stack
            gap='1'
            align='center'
            textAlign='center'
          >
            <Heading size='2xl'>{t('signup.title')}</Heading>
            <Text
              color='fg.muted'
              fontSize='sm'
              textAlign='center'
              maxW='sm'
            >
              {t('signup.subtitle')}
            </Text>
          </Stack>

          {requestError ? (
            <Box
              borderWidth='thin'
              borderRadius='card'
              borderColor='border.error'
              bg='bg.error'
              p='4'
            >
              <Text color='fg.error'>{requestError}</Text>
            </Box>
          ) : null}

          {registeredUser ? (
            <Box
              borderWidth='thin'
              borderRadius='card'
              borderColor='border.default'
              bg='bg.success'
              p='4'
            >
              <Text
                fontWeight='semibold'
                color='fg.success'
              >
                {t('signup.successTitle')}
              </Text>
              <Text color='fg.muted'>
                {t('signup.successDescription', { name: registeredUser.name })}
              </Text>
            </Box>
          ) : null}

          <Form
            methods={methods}
            onSubmit={handleSubmit}
          >
            <InputField
              name='email'
              label={t('signup.fields.emailLabel')}
              placeholder={t('signup.fields.emailPlaceholder')}
              type='email'
              isRequired
            />

            <InputField
              name='password'
              label={t('signup.fields.passwordLabel')}
              placeholder={t('signup.fields.passwordPlaceholder')}
              type='password'
              isRequired
            />

            <InputField
              name='name'
              label={t('signup.fields.nameLabel')}
              placeholder={t('signup.fields.namePlaceholder')}
              isRequired
            />

            <SelectField
              name='language'
              label={t('signup.fields.languageLabel')}
              options={languageOptions}
              isRequired
            />

            <InputField
              name='account.name'
              label={t('signup.fields.accountNameLabel')}
              placeholder={t('signup.fields.accountNamePlaceholder')}
              isRequired
            />

            <SelectField
              name='account.region'
              label={t('signup.fields.regionLabel')}
              options={regionOptions}
              isRequired
            />

            <SelectField
              name='account.contentLanguage'
              label={t('signup.fields.contentLanguageLabel')}
              options={languageOptions}
              isRequired
            />

            <Button
              type='submit'
              loading={methods.formState.isSubmitting || isRegisterPending}
              width='full'
              marginTop='8'
            >
              {t('signup.submit')}
            </Button>
          </Form>
        </Stack>
      </Card.Root>
    </Flex>
  );
}
