export const canManageDevicesRole = (role: string | undefined): boolean =>
  role === 'owner' || role === 'admin';
