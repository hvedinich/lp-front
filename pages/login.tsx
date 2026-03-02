import dynamic from 'next/dynamic';
import { PageSpinner } from '@/shared/ui';

const LoginPage = dynamic(() => import('@/pages/login/ui/LoginPage'), {
  ssr: false,
  loading: () => <PageSpinner />,
});

export default LoginPage;
