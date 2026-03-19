import { PageSpinner } from '@/shared/ui';
import dynamic from 'next/dynamic';

const Page404 = dynamic(() => import('@/pages/page404/ui/Page404'), {
  ssr: false,
  loading: () => <PageSpinner />,
});

export default Page404;
