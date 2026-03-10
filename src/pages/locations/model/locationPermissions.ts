export const canManageLocationsRole = (role: string | undefined): boolean =>
  role === 'owner' || role === 'admin';
