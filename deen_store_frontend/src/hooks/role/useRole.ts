import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '@/store'; // Adjust if needed

import {
  fetchRoles,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  attachPermissions,
  detachPermissions,
  attachUsers,
  detachUsers,
  fetchRolePermissions,
  fetchRoleUsers,
  resetRoleState
} from '@/features/role/roleSlice'; // Adjust import path if needed

export const useRole = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    roles,
    selectedRole,
    loading,
    error,
    successMessage,
    rolePermissions,
    roleUsers
  } = useSelector((state: RootState) => state.role);

  const loadRoles = useCallback(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const getRole = useCallback((id: number) => {
    dispatch(fetchRole(id));
  }, [dispatch]);

  const addRole = useCallback((payload: any) => {
    dispatch(createRole(payload));
  }, [dispatch]);

  const editRole = useCallback((id: number, payload: any) => {
    dispatch(updateRole({ id, data: payload }));
  }, [dispatch]);

  const removeRole = useCallback((id: number) => {
    dispatch(deleteRole(id));
  }, [dispatch]);

  const attachRolePermissions = useCallback((id: number, permissions: string[]) => {
    dispatch(attachPermissions({ id, permissions }));
  }, [dispatch]);

  const detachRolePermissions = useCallback((id: number, permissions: string[]) => {
    dispatch(detachPermissions({ id, permissions }));
  }, [dispatch]);

  const attachRoleUsers = useCallback((id: number, users: number[]) => {
    dispatch(attachUsers({ id, users }));
  }, [dispatch]);

  const detachRoleUsers = useCallback((id: number, users: number[]) => {
    dispatch(detachUsers({ id, users }));
  }, [dispatch]);

  const loadRolePermissions = useCallback((id: number) => {
    dispatch(fetchRolePermissions(id));
  }, [dispatch]);

  const loadRoleUsers = useCallback((id: number) => {
    dispatch(fetchRoleUsers(id));
  }, [dispatch]);

  const resetRole = useCallback(() => {
    dispatch(resetRoleState());
  }, [dispatch]);

  return {
    roles,
    selectedRole,
    loading,
    error,
    successMessage,
    rolePermissions,
    roleUsers,
    loadRoles,
    getRole,
    addRole,
    editRole,
    removeRole,
    attachRolePermissions,
    detachRolePermissions,
    attachRoleUsers,
    detachRoleUsers,
    loadRolePermissions,
    loadRoleUsers,
    resetRole,
  };
};