import dynamic from 'next/dynamic';
import { withMainLayout } from '@/widgets/mainLayout';
import { PageSpinner } from '@/shared/ui';

export default withMainLayout(
  dynamic(() => import('@/pages/device/ui/DevicePage'), {
    ssr: false,
    loading: () => <PageSpinner />,
  }),
);
