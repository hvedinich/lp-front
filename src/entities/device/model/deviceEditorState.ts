import type { DeviceError } from '@/entities/device';

interface ResolveDeviceEditorStateOptions {
  canManage: boolean;
  error: DeviceError | null | undefined;
  isActivatePending?: boolean;
  isConfigurePending?: boolean;
  isDeactivatePending?: boolean;
  isDevicePending?: boolean;
}

interface ResolveDeviceEditorStateResult {
  isBadRequest: boolean;
  isNotFound: boolean;
  isReadonly: boolean;
  isSubmitting: boolean;
}

export const resolveDeviceEditorState = ({
  canManage,
  error,
  isActivatePending = false,
  isConfigurePending = false,
  isDeactivatePending = false,
  isDevicePending = false,
}: ResolveDeviceEditorStateOptions): ResolveDeviceEditorStateResult => {
  const isReadonly = !canManage;
  const isNotFound = error?.code === 'NOT_FOUND';
  const isBadRequest = error?.code === 'BAD_REQUEST';
  const isSubmitting =
    isDevicePending || isActivatePending || isConfigurePending || isDeactivatePending;

  return {
    isBadRequest,
    isNotFound,
    isReadonly,
    isSubmitting,
  };
};
