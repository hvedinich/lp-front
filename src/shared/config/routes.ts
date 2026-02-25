export const publicRoutes = ['/login', '/signup'] as const;

export const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.includes(pathname as (typeof publicRoutes)[number]);
};
