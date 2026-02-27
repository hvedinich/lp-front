import dynamic from 'next/dynamic';
import { withMainLayout } from '@/widgets/mainLayout';

export default withMainLayout(dynamic(() => import('@/pages/home/ui/HomePage'), { ssr: false }));
