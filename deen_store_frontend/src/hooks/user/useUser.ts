// Updated hook to handle pagination and filters
"use client";
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '@/store';
import { clearMessages, fetchSingleUser, fetchUsers, resetUserState, setSelectedUser } from '@/features/user/userSlice';
import { User } from '@/types/ui';

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

    const loadSingleUser = useCallback(
        (userId: string, relations?: string) => {
          return dispatch(fetchSingleUser({ userId, relations }));
        },
        [dispatch]
      );

    const selectUser = useCallback(
        (user: User | null) => {
            dispatch(setSelectedUser(user));
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
        selectedUser,
        pagination,
        stats,
        
        // Pagination
        currentPage: pagination.current_page,
        lastPage: pagination.last_page,
        total: pagination.total,
        perPage: pagination.per_page,
        
        // Actions
        loadUsers,
        selectUser,
        clearMessages: clearAllMessages,
        resetUsers,
        loadSingleUser
    };
};