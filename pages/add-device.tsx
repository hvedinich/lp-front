import { PageSpinner } from '@/shared/ui';
import dynamic from 'next/dynamic';

const AddDevicePage = dynamic(() => import('@/pages/addDevice/ui/AddDevicePage'), {
  ssr: false,
  loading: () => <PageSpinner />,
});

export default AddDevicePage;
