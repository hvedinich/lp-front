export const publicRoutes = ['/login', '/signup'] as const;

export const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.includes(pathname as (typeof publicRoutes)[number]);
};

/**
 * Builds the login redirect target URL for a given current path.
 * Returns null if the current path is already a public auth route (no redirect needed).
 */
export const buildLoginRedirect = (currentPath: string): string | null => {
  const normalizedPath = currentPath.trim().length > 0 ? currentPath : '/';

  let pathname = normalizedPath;
  try {
    pathname = new URL(normalizedPath, 'http://localhost').pathname;
  } catch {
    pathname = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  }

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return `/login?next=${encodeURIComponent(normalizedPath)}`;
};
