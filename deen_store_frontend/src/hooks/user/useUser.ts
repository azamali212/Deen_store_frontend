"use client";
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '@/store';
import { 
  clearMessages, 
  fetchSingleUser, 
  fetchUsers, 
  resetUserState, 
  setSelectedUser 
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
    stats
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
          // Type assertion with proper conversion
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

  return {
    // State
    users,
    loading,
    error,
    successMessage,
    selectedUser: selectedUser as unknown as DetailedUser | null,
    pagination,
    stats,
    
    // Actions
    loadUsers,
    loadUserDetails,
    selectUser,
    clearMessages: clearAllMessages,
    resetUsers,
  };
};