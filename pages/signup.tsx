import dynamic from 'next/dynamic';
import { PageSpinner } from '@/shared/ui';

const SignupPage = dynamic(() => import('@/pages/signup/ui/SignupPage'), {
  ssr: false,
  loading: () => <PageSpinner />,
});

export default SignupPage;
