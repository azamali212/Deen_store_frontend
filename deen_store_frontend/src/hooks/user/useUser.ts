// hooks/user/useUser.ts
"use client";
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '@/store';
import {
  clearMessages,
  fetchSingleUser,
  fetchUsers,
  resetUserState,
  setSelectedUser,
  softDeleteUser,
  fetchDeletedUsers,
  forceDeleteUser,
  restoreDeletedUser,
  restoreAllDeletedUsers,
  bulkDeleteSoftDeletedUsers,
  deactivateUser as deactivateUserAction,
  activateUser as activateUserAction,
  assignRolesToUser as assignRolesToUserAction,
  removeRolesFromUser as removeRolesFromUserAction,
  changeUserRole as changeUserRoleAction,
  syncUserRoles as syncUserRolesAction,
  assignTemporaryPermissions as assignTemporaryPermissionsAction,
  revokeTemporaryPermissions as revokeTemporaryPermissionsAction,
  getTemporaryPermissions as getTemporaryPermissionsAction,
  getActiveTemporaryPermissions as getActiveTemporaryPermissionsAction,
  cleanupExpiredTemporaryPermissions as cleanupExpiredTemporaryPermissionsAction,
  clearTemporaryPermissions,
  clearTemporaryPermissionsError
} from '@/features/user/userSlice';
import { DetailedUser, TableUser, TemporaryPermissionAssignment, TemporaryPermissionsResponse, User } from '@/types/ui';

export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    users,
    loading,
    error,
    successMessage,
    pagination,
    selectedUser,
    stats,
    deletedUsers // Make sure this is properly destructured
  } = useSelector((state: RootState) => state.user);

  const loadUsers = useCallback(
    (page?: number, search?: string, filters?: Record<string, string>) => {
      return dispatch(fetchUsers({
        page: page || 1,
        search: search || '',
        filters: filters || {}
      }));
    },
    [dispatch]
  );

  const loadUserDetails = useCallback(
    async (userId: string): Promise<DetailedUser | null> => {
      try {
        const result = await dispatch(fetchSingleUser({
          userId,
          relations: 'roles,permissions'
        }));

        if (fetchSingleUser.fulfilled.match(result)) {
          const userData = result.payload as unknown as DetailedUser;
          return userData;
        }
        return null;
      } catch (error) {
        console.error('Error loading user details:', error);
        return null;
      }
    },
    [dispatch]
  );

  const selectUser = useCallback(
    (user: DetailedUser | null) => {
      dispatch(setSelectedUser(user as unknown as User));
    },
    [dispatch]
  );

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const resetUsers = useCallback(() => {
    dispatch(resetUserState());
  }, [dispatch]);

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        const result = await dispatch(softDeleteUser(userId));
        if (softDeleteUser.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to delete user'
        };
      } catch (error) {
        console.error('Error deleting user:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const loadDeletedUsers = useCallback(
    async () => {
      try {
        const result = await dispatch(fetchDeletedUsers());
        if (fetchDeletedUsers.fulfilled.match(result)) {
          return { success: true, data: result.payload.data };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to load deleted users'
        };
      } catch (error) {
        console.error('Error loading deleted users:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const restoreUser = useCallback(
    async (userId: string) => {
      try {
        const result = await dispatch(restoreDeletedUser(userId));
        if (restoreDeletedUser.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to restore user'
        };
      } catch (error) {
        console.error('Error restoring user:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const forceDeletePermanently = useCallback(
    async (userId: string) => {
      try {
        const result = await dispatch(forceDeleteUser(userId));
        if (forceDeleteUser.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to permanently delete user'
        };
      } catch (error) {
        console.error('Error force deleting user:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const bulkDeleteUsers = useCallback(
    async (userIds: string[]) => {
      try {
        const result = await dispatch(bulkDeleteSoftDeletedUsers(userIds));
        if (bulkDeleteSoftDeletedUsers.fulfilled.match(result)) {
          return {
            success: true,
            message: result.payload.message,
            deleted_count: result.payload.deleted_count,
            failed_ids: result.payload.failed_ids
          };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to bulk delete users'
        };
      } catch (error) {
        console.error('Error bulk deleting users:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const restoreAllUsers = useCallback(
    async () => {
      try {
        const result = await dispatch(restoreAllDeletedUsers());
        if (restoreAllDeletedUsers.fulfilled.match(result)) {
          return {
            success: true,
            message: result.payload.message,
            restored_count: result.payload.restored_count || 0,
            failed_ids: result.payload.failed_ids || []
          };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to restore all users',
          restored_count: 0,
          failed_ids: []
        };
      } catch (error) {
        console.error('Error restoring all users:', error);
        return {
          success: false,
          message: 'An unexpected error occurred',
          restored_count: 0,
          failed_ids: []
        };
      }
    },
    [dispatch]
  );

  const deactivateUser = useCallback(
    async (userId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(deactivateUserAction({ userId, reason }));
        if (deactivateUserAction.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to deactivate user'
        };
      } catch (error) {
        console.error('Error deactivating user:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const activateUser = useCallback(
    async (userId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(activateUserAction({ userId, reason }));
        if (activateUserAction.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to activate user'
        };
      } catch (error) {
        console.error('Error activating user:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  // Add these functions to the useUser hook return
  const assignRoles = useCallback(
    async (userId: string, roles: string[], sync: boolean = true): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(assignRolesToUserAction({ userId, roles, sync }));
        if (assignRolesToUserAction.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to assign roles'
        };
      } catch (error) {
        console.error('Error assigning roles:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const removeRoles = useCallback(
    async (userId: string, roles: string[]): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(removeRolesFromUserAction({ userId, roles }));
        if (removeRolesFromUserAction.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to remove roles'
        };
      } catch (error) {
        console.error('Error removing roles:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const changeRole = useCallback(
    async (userId: string, newRole: string): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(changeUserRoleAction({ userId, newRole }));
        if (changeUserRoleAction.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to change user role'
        };
      } catch (error) {
        console.error('Error changing user role:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  // Add the syncRoles function
  const syncRoles = useCallback(
    async (userId: string, roles: string[], sync: boolean = true): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(syncUserRolesAction({ userId, roles, sync }));
        if (syncUserRolesAction.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to sync roles'
        };
      } catch (error) {
        console.error('Error syncing roles:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  // Temporary Permissions Methods
  const assignTemporaryPermissions = useCallback(
    async (
      userId: string,
      permissions: TemporaryPermissionAssignment[],
      reason?: string
    ): Promise<{ success: boolean; message: string; data?: TemporaryPermissionsResponse }> => {
      try {
        const result = await dispatch(assignTemporaryPermissionsAction({ userId, permissions, reason }));
        if (assignTemporaryPermissionsAction.fulfilled.match(result)) {
          return {
            success: true,
            message: result.payload.message,
            data: result.payload
          };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to assign temporary permissions'
        };
      } catch (error) {
        console.error('Error assigning temporary permissions:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );


  // Add this to your useUser hook
  const revokeTemporaryPermissions = useCallback(
    async (
      userId: string,
      permissions: string[],
      reason?: string
    ): Promise<{ success: boolean; message: string; data?: any }> => {
      try {
        const result = await dispatch(revokeTemporaryPermissionsAction({ userId, permissions, reason }));
        if (revokeTemporaryPermissionsAction.fulfilled.match(result)) {
          return {
            success: true,
            message: result.payload.message,
            data: result.payload
          };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to revoke temporary permissions'
        };
      } catch (error) {
        console.error('Error revoking temporary permissions:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const loadTemporaryPermissions = useCallback(
    async (userId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(getTemporaryPermissionsAction(userId));
        if (getTemporaryPermissionsAction.fulfilled.match(result)) {
          return { success: true, message: 'Temporary permissions loaded successfully' };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to load temporary permissions'
        };
      } catch (error) {
        console.error('Error loading temporary permissions:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const loadActiveTemporaryPermissions = useCallback(
    async (userId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(getActiveTemporaryPermissionsAction(userId));
        if (getActiveTemporaryPermissionsAction.fulfilled.match(result)) {
          return { success: true, message: 'Active temporary permissions loaded successfully' };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to load active temporary permissions'
        };
      } catch (error) {
        console.error('Error loading active temporary permissions:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );

  const cleanupExpiredPermissions = useCallback(
    async (): Promise<{ success: boolean; message: string }> => {
      try {
        const result = await dispatch(cleanupExpiredTemporaryPermissionsAction());
        if (cleanupExpiredTemporaryPermissionsAction.fulfilled.match(result)) {
          return { success: true, message: result.payload.message };
        }
        return {
          success: false,
          message: result.payload?.message || 'Failed to cleanup expired permissions'
        };
      } catch (error) {
        console.error('Error cleaning up expired permissions:', error);
        return {
          success: false,
          message: 'An unexpected error occurred'
        };
      }
    },
    [dispatch]
  );


  return {
    // State
    users,
    loading,
    error,
    successMessage,
    selectedUser: selectedUser as unknown as DetailedUser | null,
    pagination,
    stats,
    deletedUsers: deletedUsers?.data || [], // Return the data array or empty array if undefined


    // Actions
    loadUsers,
    loadUserDetails,
    selectUser,
    clearMessages: clearAllMessages,
    resetUsers,
    deleteUser,
    loadDeletedUsers,
    restoreUser,
    forceDeleteUser: forceDeletePermanently,
    bulkDeleteUsers,
    restoreAllUsers,
    deactivateUser,
    activateUser,
    assignRoles,
    removeRoles,
    changeRole,
    syncRoles,

    // Temporary Permissions Actions
    assignTemporaryPermissions,
    revokeTemporaryPermissions,
    loadTemporaryPermissions,
    loadActiveTemporaryPermissions,
    cleanupExpiredPermissions,
    clearTemporaryPermissions: () => dispatch(clearTemporaryPermissions()),
    clearTemporaryPermissionsError: () => dispatch(clearTemporaryPermissionsError())
  };
};