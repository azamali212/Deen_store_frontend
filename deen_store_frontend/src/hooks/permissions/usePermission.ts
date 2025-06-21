"use client";
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '@/store'; // Adjust if needed

import {
  fetchPermissions,
  createPermission,
  clearMessages,
  exportPermissionsToExcel,
  bulkDeletePermissions,
  updatePermissionAction,
  importPermissionsFromExcel,
  fetchPermissionDistribution

} from '@/features/permissions/permissionsSlice';
import api from '@/services/api';
import { color } from 'framer-motion';
import { Permission } from '@/types/ui';

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
    (payload: { name: string; slug?: string; color?: string }) => {
      dispatch(createPermission(payload));
    },
    [dispatch]
  );

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // In your usePermission.ts
  const exportToExcel = useCallback(() => {
    dispatch(exportPermissionsToExcel());
  }, [dispatch]);

  const deleteMultiplePermissions = async (ids: number[]) => {
    return await dispatch(bulkDeletePermissions({ ids })).unwrap();
  };

  const updatePermission = useCallback(
    async (id: number, data: { name: string; slug: string }): Promise<Permission> => {
      return await dispatch(updatePermissionAction({ id, data })).unwrap();
    },
    [dispatch]
  );

 // In your usePermission.ts
const importFromExcel = useCallback(
  async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
          const result = await dispatch(importPermissionsFromExcel(formData)).unwrap();
          // Optionally reload permissions after successful import
          //dispatch(fetchPermissions());
          return result;
      } catch (error) {
          throw error; // Let the calling component handle the error
      }
  },
  [dispatch]
);

const fetchDistribution = useCallback(async () => {
  return await dispatch(fetchPermissionDistribution()).unwrap();
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
    exportToExcel,
    deleteMultiplePermissions,
    updatePermission,
    importFromExcel,
    distribution: useSelector((state: RootState) => state.permissions.distribution),
    fetchDistribution
  };
};