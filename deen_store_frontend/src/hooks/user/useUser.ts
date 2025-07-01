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
  bulkDeleteSoftDeletedUsers
} from '@/features/user/userSlice';
import { DetailedUser, TableUser, User } from '@/types/ui';

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
    restoreAllUsers
  };
};