import type { LocationError } from '@/entities/location';

type LocationEditorMode = 'create' | 'edit';

interface ResolveLocationEditorStateOptions {
  canManage: boolean;
  isCreatePending?: boolean;
  isLocationPending?: boolean;
  isUpdatePending?: boolean;
  mode: LocationEditorMode;
  error: LocationError | null | undefined;
}

interface ResolveLocationEditorStateResult {
  isForbidden: boolean;
  isNotFound: boolean;
  isReadonly: boolean;
  isSubmitting: boolean;
}

export const resolveLocationEditorState = ({
  canManage,
  error,
  isCreatePending = false,
  isLocationPending = false,
  isUpdatePending = false,
  mode,
}: ResolveLocationEditorStateOptions): ResolveLocationEditorStateResult => {
  const isReadonly = mode === 'edit' && !canManage;
  const isNotFound = error?.code === 'NOT_FOUND';
  const isForbidden = error?.code === 'FORBIDDEN';
  const isSubmitting = isLocationPending || isCreatePending || isUpdatePending;

  return {
    isForbidden,
    isNotFound,
    isReadonly,
    isSubmitting,
  };
};
