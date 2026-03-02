import dynamic from 'next/dynamic';
import { withMainLayout } from '@/widgets/mainLayout';
import { PageSpinner } from '@/shared/ui';

export default withMainLayout(
  dynamic(() => import('@/pages/locations/ui/LocationsPage'), {
    ssr: false,
    loading: () => <PageSpinner />,
  }),
);
