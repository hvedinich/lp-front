import dynamic from 'next/dynamic';

const LoginPage = dynamic(() => import('@/pages/login/ui/LoginPage'), { ssr: false });

export default LoginPage;
