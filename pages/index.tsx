import { Center, Spinner } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { withMainLayout } from '@/widgets/mainLayout';

export default withMainLayout(
  dynamic(() => import('@/pages/home/ui/HomePage'), {
    ssr: false,
    loading: () => (
      <Center minH='dvh'>
        <Spinner size='lg' />
      </Center>
    ),
  }),
);
