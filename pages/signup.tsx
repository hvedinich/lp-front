import dynamic from 'next/dynamic';

const SignupPage = dynamic(() => import('@/pages/signup/ui/SignupPage'), { ssr: false });

export default SignupPage;
