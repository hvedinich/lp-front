import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('@/pages/home/ui/HomePage'), { ssr: false });

export default HomePage;
