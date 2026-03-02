import { Center, Spinner } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const LoginPage = dynamic(() => import('@/pages/login/ui/LoginPage'), {
  ssr: false,
  loading: () => (
    <Center minH='dvh'>
      <Spinner size='lg' />
    </Center>
  ),
});

export default LoginPage;
