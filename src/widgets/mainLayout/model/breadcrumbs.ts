import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useHasActiveSession } from '@/entities/auth';
import { useLocationById } from '@/entities/location';
import { getActiveNavItem } from './navigation';

export interface AppBreadcrumbItem {
  href?: string;
  label: string;
}

const isLocationsCreateRoute = (pathname: string): boolean => pathname === '/locations/new';
const isDevicesListRoute = (pathname: string): boolean => pathname === '/devices';
const isLocationsEditRoute = (pathname: string): boolean => pathname === '/locations/[id]';
const isLocationsListRoute = (pathname: string): boolean => pathname === '/locations';

interface ResolveAppBreadcrumbsInput {
  deviceListLabel: string;
  fallbackLabel: string;
  locationCreateLabel: string;
  locationDynamicLabel: string;
  locationListLabel: string;
  pathname: string;
  sectionLabel: string;
}

export const resolveAppBreadcrumbs = ({
  deviceListLabel,
  fallbackLabel,
  locationCreateLabel,
  locationDynamicLabel,
  locationListLabel,
  pathname,
  sectionLabel,
}: ResolveAppBreadcrumbsInput): AppBreadcrumbItem[] => {
  if (isDevicesListRoute(pathname)) {
    return [{ label: deviceListLabel }];
  }

  if (isLocationsListRoute(pathname)) {
    return [{ label: locationListLabel }];
  }

  if (isLocationsCreateRoute(pathname)) {
    return [{ href: '/locations', label: locationListLabel }, { label: locationCreateLabel }];
  }

  if (isLocationsEditRoute(pathname)) {
    return [
      { href: '/locations', label: locationListLabel },
      { label: locationDynamicLabel || fallbackLabel },
    ];
  }

  return [{ label: sectionLabel }];
};

export const useAppBreadcrumbs = (): AppBreadcrumbItem[] => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const activeItem = getActiveNavItem(router.pathname);
  const locationId = typeof router.query.id === 'string' ? router.query.id : null;

  const sessionQuery = useHasActiveSession({
    options: {
      enabled: isLocationsEditRoute(router.pathname),
    },
  });
  const accountId = sessionQuery.data?.payload?.account.id;

  const locationQuery = useLocationById({
    scope: {
      accountId,
      id: locationId,
    },
    options: {
      enabled: isLocationsEditRoute(router.pathname),
    },
  });

  return resolveAppBreadcrumbs({
    deviceListLabel: t('workspace.menu.devices'),
    fallbackLabel: t('workspace.locationsPage.breadcrumbFallback'),
    locationCreateLabel: t('workspace.locationsPage.createTitle'),
    locationDynamicLabel: locationQuery.data?.name ?? locationId ?? '',
    locationListLabel: t('workspace.menu.locations'),
    pathname: router.pathname,
    sectionLabel: t(`workspace.menu.${activeItem.key}`),
  });
};
