import { describe, expect, it } from 'vitest';
import { resolveLocationEditorState } from './locationEditorState';

describe('resolveLocationEditorState', () => {
  it('returns create mode state', () => {
    const state = resolveLocationEditorState({
      canManage: true,
      error: null,
      isCreatePending: false,
      mode: 'create',
    });

    expect(state).toEqual({
      isForbidden: false,
      isNotFound: false,
      isReadonly: false,
      isSubmitting: false,
    });
  });

  it('returns readonly for edit when user cannot manage', () => {
    const state = resolveLocationEditorState({
      canManage: false,
      error: null,
      mode: 'edit',
    });

    expect(state.isReadonly).toBe(true);
  });

  it('returns not-found and submitting flags when appropriate', () => {
    const state = resolveLocationEditorState({
      canManage: true,
      error: { code: 'NOT_FOUND', message: 'Not found' },
      isLocationPending: true,
      mode: 'edit',
    });

    expect(state.isNotFound).toBe(true);
    expect(state.isSubmitting).toBe(true);
  });
});
