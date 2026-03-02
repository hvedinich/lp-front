import { Center, Spinner } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const SignupPage = dynamic(() => import('@/pages/signup/ui/SignupPage'), {
  ssr: false,
  loading: () => (
    <Center minH='dvh'>
      <Spinner size='lg' />
    </Center>
  ),
});

export default SignupPage;
