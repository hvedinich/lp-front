import { useHasActiveSession } from '@/entities/auth';
import { Button, Heading, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

const ERROR_CODE = '404';

const Window404 = () => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const sessionQuery = useHasActiveSession({ options: { enabled: router.isReady } });
  const isAuth = sessionQuery?.data?.state === 'authenticated';

  const buttonData = isAuth
    ? {
        text: t('404.mainPageBtn'),
        href: '/',
      }
    : {
        text: t('404.loginBtn'),
        href: '/login',
      };

  return (
    <VStack
      h='full'
      justifyContent='center'
    >
      <Text
        fontSize='9xl'
        textAlign='center'
        textDecoration='underline'
      >
        {ERROR_CODE}
      </Text>
      <Heading
        as='h1'
        size='4xl'
        textAlign='center'
      >
        {t('404.title')}
      </Heading>
      <Text
        mt='2'
        textAlign='center'
      >
        {t('404.description')}
      </Text>

      <Link
        style={{ width: '100%' }}
        href={buttonData.href}
      >
        <Button
          mt='4'
          w='full'
        >
          {buttonData.text}
        </Button>
      </Link>
    </VStack>
  );
};

export default Window404;
