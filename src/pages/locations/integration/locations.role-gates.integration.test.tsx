import { describe, expect, it } from 'vitest';
import { canManageLocationsRole } from '../lib/locationPermissions';
import { resolveLocationEditorState } from '../lib/locationEditorState';

describe('locations role gates integration', () => {
  it('restricts mutate controls for member and enables for admin/owner', () => {
    const memberCanManage = canManageLocationsRole('member');
    const adminCanManage = canManageLocationsRole('admin');
    const ownerCanManage = canManageLocationsRole('owner');

    expect(memberCanManage).toBe(false);
    expect(adminCanManage).toBe(true);
    expect(ownerCanManage).toBe(true);

    const memberEditState = resolveLocationEditorState({
      canManage: memberCanManage,
      error: null,
      mode: 'edit',
    });
    const adminEditState = resolveLocationEditorState({
      canManage: adminCanManage,
      error: null,
      mode: 'edit',
    });
    const ownerEditState = resolveLocationEditorState({
      canManage: ownerCanManage,
      error: null,
      mode: 'edit',
    });

    expect(memberEditState.isReadonly).toBe(true);
    expect(adminEditState.isReadonly).toBe(false);
    expect(ownerEditState.isReadonly).toBe(false);
  });
});
