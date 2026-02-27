import { Box, Button, Card, Center, Flex, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
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
  const isCheckingSession = router.isReady && sessionQuery.isPending;
  const sessionState = sessionQuery.data?.state;

  useEffect(() => {
    if (!router.isReady || sessionQuery.isPending) {
      return;
    }

    if (sessionState === 'authenticated') {
      void router.replace('/');
    }
  }, [router, router.isReady, sessionState, sessionQuery.isPending]);

  if (isCheckingSession) {
    return (
      <Center
        minH='dvh'
        width='full'
      >
        <Spinner size='lg' />
      </Center>
    );
  }

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
            <Heading size='2xl'>{t('login.title')}</Heading>
            <Text
              color='fg.muted'
              fontSize='sm'
              textAlign='center'
            >
              {t('login.subtitle')}
            </Text>
          </Stack>

          {requestError ? (
            <Box
              borderWidth='[1px]'
              borderRadius='card'
              borderColor='border.error'
              bg='bg.error'
              p='4'
            >
              <Text color='fg.error'>{requestError}</Text>
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
              marginTop='8'
              colorPalette='black'
            >
              {t('login.submit')}
            </Button>
          </Form>
        </Stack>
      </Card.Root>
    </Flex>
  );
}
