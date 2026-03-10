import { useRouter } from 'next/router';
import { useHasActiveSession } from '@/entities/auth';
import { usePublicDevice } from '@/entities/device';
import { AuthPageLayout } from '@/widgets/authLayout';
import { PageSpinner } from '@/shared/ui';
import { Window404 } from '@/widgets/window404';
import AddDevicePageContent from './AddDevicePageContent';
import { useLocations } from '@/entities/location';
import { DEFAULT_VALUES } from '../lib/constants';

export default function AddDevicePage() {
  const router = useRouter();

  const shortCode = typeof router.query.id === 'string' ? router.query.id : undefined;
  const isSuccess = router?.query?.success === 'true';

  const deviceQuery = usePublicDevice(shortCode);
  const sessionQuery = useHasActiveSession({ options: { enabled: router.isReady } });
  const accountId = sessionQuery.data?.payload?.account.id ?? '';
  const locationsQuery = useLocations({ scope: { accountId } });

  const isAuth = sessionQuery?.data?.state === 'authenticated';

  const isLoading =
    !router.isReady ||
    (!!shortCode && deviceQuery.isPending) ||
    sessionQuery.isPending ||
    locationsQuery.isPending;

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!shortCode || !deviceQuery.data || (deviceQuery.data?.status === 'active' && !isSuccess)) {
    return (
      <AuthPageLayout>
        <Window404 />
      </AuthPageLayout>
    );
  }

  return (
    <AddDevicePageContent
      isAuth={isAuth}
      defaultValues={{
        ...DEFAULT_VALUES,
        isNewLocation: !isAuth,
        device: deviceQuery.data!,
      }}
    />
  );
}
