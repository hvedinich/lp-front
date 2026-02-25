import { Box, Button, Center, Flex, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { useHasActiveSession, useLoginUser, type LoginPayload } from '@/entities/auth';
import { useZodForm } from '@/shared/lib';
import { Form, InputField } from '@/shared/ui';

export default function LoginPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const sessionQuery = useHasActiveSession({ enabled: router.isReady });
  const {
    mutateAsync: loginUser,
    isPending: isLoginPending,
    error: loginError,
    reset: resetLoginError,
  } = useLoginUser();

  const loginSchema = z.object({
    email: z.email(t('login.validation.emailInvalid')),
    password: z.string().min(8, t('login.validation.passwordMin')),
  });

  const methods = useZodForm<LoginPayload>({
    schema: loginSchema,
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit: SubmitHandler<LoginPayload> = async (values) => {
    resetLoginError();

    try {
      await loginUser(values);

      const target = typeof router.query.next === 'string' ? router.query.next : '/';
      await router.replace(target);
    } catch {
      // Error state is handled by React Query mutation result.
    }
  };

  const requestError = loginError ? loginError.message || t('login.errorFallback') : null;
  const isCheckingSession = router.isReady && sessionQuery.isFetching;

  useEffect(() => {
    if (!router.isReady || sessionQuery.isFetching) {
      return;
    }

    if (sessionQuery.data === true) {
      void router.replace('/');
    }
  }, [router, router.isReady, sessionQuery.data, sessionQuery.isFetching]);

  if (isCheckingSession) {
    return (
      <Center
        minH='100dvh'
        width='full'
      >
        <Spinner size='lg' />
      </Center>
    );
  }

  return (
    <Flex
      minH='100vh'
      align='center'
      justify='center'
      p={6}
    >
      <Box
        width='full'
        maxW='lg'
        borderWidth='1px'
        borderRadius='xl'
        p={8}
      >
        <Stack gap={6}>
          <Stack gap={2}>
            <Heading size='2xl'>{t('login.title')}</Heading>
            <Text color='fg.muted'>{t('login.subtitle')}</Text>
          </Stack>

          {requestError ? (
            <Box
              borderWidth='1px'
              borderRadius='lg'
              borderColor='red.300'
              bg='red.50'
              p={4}
            >
              <Text color='red.700'>{requestError}</Text>
            </Box>
          ) : null}

          <Form
            methods={methods}
            onSubmit={handleSubmit}
          >
            <InputField
              name='email'
              label={t('login.fields.emailLabel')}
              placeholder={t('login.fields.emailPlaceholder')}
              type='email'
              isRequired
            />

            <InputField
              name='password'
              label={t('login.fields.passwordLabel')}
              placeholder={t('login.fields.passwordPlaceholder')}
              type='password'
              isRequired
            />

            <Button
              type='submit'
              loading={methods.formState.isSubmitting || isLoginPending}
              width='full'
            >
              {t('login.submit')}
            </Button>
          </Form>
        </Stack>
      </Box>
    </Flex>
  );
}
