"use client";
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '@/store'; // Adjust if needed

import {
    fetchPermissions,
    createPermission,
    clearMessages,
} from '@/features/permissions/permissionsSlice'; 

export const usePermission = () => {
    const dispatch = useDispatch<AppDispatch>();

    const {
        permissions,
        loading,
        error,
        successMessage,
        pagination,
    } = useSelector((state: RootState) => state.permissions);

    const loadPermissions = useCallback(
        (page?: number, per_page?: number) => {
          // Fetch all permissions by default
          dispatch(fetchPermissions({ page: page || 1, per_page: per_page || 1000 }));
        },
        [dispatch]
      );

    const addPermission = useCallback(
      (payload: { name: string; guard_name?: string }) => {
        dispatch(createPermission(payload));
      },
      [dispatch]
    );

    const clearAllMessages = useCallback(() => {
      dispatch(clearMessages());
    }, [dispatch]);

    return {
        permissions,
        loading,
        error,
        successMessage,
        currentPage: pagination.currentPage,
        lastPage: pagination.lastPage,
        total: pagination.total,
        loadPermissions,
        addPermission,
        clearMessages: clearAllMessages,
    };
};