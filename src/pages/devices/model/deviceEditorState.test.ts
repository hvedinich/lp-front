import { describe, expect, it } from 'vitest';
import { resolveDeviceEditorState } from './deviceEditorState';

describe('resolveDeviceEditorState', () => {
  it('returns readonly when user cannot manage devices', () => {
    const state = resolveDeviceEditorState({
      canManage: false,
      error: null,
    });

    expect(state).toEqual({
      isBadRequest: false,
      isNotFound: false,
      isReadonly: true,
      isSubmitting: false,
    });
  });

  it('returns not-found and bad-request flags when appropriate', () => {
    expect(
      resolveDeviceEditorState({
        canManage: true,
        error: { code: 'NOT_FOUND', message: 'Missing' },
      }).isNotFound,
    ).toBe(true);

    expect(
      resolveDeviceEditorState({
        canManage: true,
        error: { code: 'BAD_REQUEST', message: 'Invalid UUID' },
      }).isBadRequest,
    ).toBe(true);
  });

  it('returns submitting when any async branch is pending', () => {
    const state = resolveDeviceEditorState({
      canManage: true,
      error: null,
      isConfigurePending: true,
    });

    expect(state.isSubmitting).toBe(true);
  });
});
