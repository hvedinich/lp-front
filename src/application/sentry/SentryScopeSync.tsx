'use client';

import { setContext, setTag, setUser } from '@sentry/core';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef } from 'react';
import { useHasActiveSession } from '@/entities/auth';
import { useLocationSelection } from '@/features/location-selection';

type RouteGroup = 'auth' | 'campaigns' | 'devices' | 'locations' | 'scans' | 'surveys' | 'unknown';

type ScopeSnapshot = {
  account: {
    id: string;
    name: string;
    role: string;
  } | null;
  location: {
    id: string;
    isDefault: boolean;
    name: string;
    publicSlug: string;
  } | null;
  route: {
    group: RouteGroup;
    path: string;
  };
  sessionState: string;
  user: {
    email: string;
    id: string;
    language: string;
    name: string | null;
  } | null;
};

const normalizeRoutePath = (value: string): string => value.split('?')[0]?.split('#')[0] ?? '/';

export const getRouteGroup = (pathname: string): RouteGroup => {
  const normalizedPath = normalizeRoutePath(pathname);

  if (normalizedPath === '/login' || normalizedPath === '/signup') {
    return 'auth';
  }

  if (normalizedPath === '/devices') {
    return 'devices';
  }

  if (normalizedPath === '/campaigns') {
    return 'campaigns';
  }

  if (normalizedPath === '/scans') {
    return 'scans';
  }

  if (normalizedPath === '/surveys') {
    return 'surveys';
  }

  if (normalizedPath === '/locations' || normalizedPath.startsWith('/locations/')) {
    return 'locations';
  }

  return 'unknown';
};

const toSnapshotKey = (snapshot: ScopeSnapshot): string => JSON.stringify(snapshot);

export function SentryScopeSync() {
  const router = useRouter();
  const sessionQuery = useHasActiveSession();
  const { selectedLocation } = useLocationSelection();
  const sessionPayload = sessionQuery.data?.payload ?? null;
  const routePath = normalizeRoutePath(router.pathname || router.asPath || '/');
  const snapshot: ScopeSnapshot = useMemo(
    () => ({
      account: sessionPayload?.account
        ? {
            id: sessionPayload.account.id,
            name: sessionPayload.account.name,
            role: sessionPayload.account.role,
          }
        : null,
      location: selectedLocation
        ? {
            id: selectedLocation.id,
            isDefault: selectedLocation.isDefault,
            name: selectedLocation.name,
            publicSlug: selectedLocation.publicSlug,
          }
        : null,
      route: {
        group: getRouteGroup(routePath),
        path: routePath,
      },
      sessionState: sessionQuery.data?.state ?? 'unknown',
      user: sessionPayload?.user
        ? {
            email: sessionPayload.user.email,
            id: sessionPayload.user.id,
            language: sessionPayload.user.language,
            name: sessionPayload.user.name,
          }
        : null,
    }),
    [routePath, selectedLocation, sessionPayload, sessionQuery.data?.state],
  );
  const snapshotKey = toSnapshotKey(snapshot);
  const previousSnapshotKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousSnapshotKeyRef.current === snapshotKey) {
      return;
    }

    previousSnapshotKeyRef.current = snapshotKey;

    setTag('route_group', snapshot.route.group);
    setTag('session_state', snapshot.sessionState);
    setContext('route', snapshot.route);
    setContext('account', snapshot.account);
    setContext('location', snapshot.location);
    setUser(
      snapshot.user
        ? {
            email: snapshot.user.email,
            id: snapshot.user.id,
            username: snapshot.user.name ?? undefined,
          }
        : null,
    );
  }, [snapshot, snapshotKey]);

  return null;
}
