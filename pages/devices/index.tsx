import dynamic from 'next/dynamic';
import { withMainLayout } from '@/widgets/mainLayout';
import { PageSpinner } from '@/shared/ui';

export default withMainLayout(
  dynamic(() => import('@/pages/devices/ui/DevicesPage'), {
    ssr: false,
    loading: () => <PageSpinner />,
  }),
);
