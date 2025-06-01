"use client";
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useState } from 'react';
import { RootState, AppDispatch } from '@/store'; // Adjust if needed
import  debounce  from 'lodash.debounce';

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
import { Role } from '@/types/ui';

export const useRole = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    roles,
    selectedRole,
    loading,
    error,
    pagination,
    successMessage,
    rolePermissions,
    roleUsers
  } = useSelector((state: RootState) => state.role);

  const loadRoles = useCallback((page: number = pagination.current_page, search?: string) => {
    dispatch(fetchRoles({ page, search }));
  }, [dispatch, pagination.current_page]);

  const handleSearch = useCallback(
    debounce((query: string) => {
      setIsSearching(true);
      dispatch(fetchRoles({ page: 1, search: query }))
        .finally(() => setIsSearching(false));
    }, 500), // 500ms debounce delay
    [dispatch]
  );

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const goToNextPage = useCallback(() => {
    if (pagination.current_page < pagination.last_page) {
      dispatch(fetchRoles({
        page: pagination.current_page + 1,
        search: searchQuery
      }));
    }
  }, [dispatch, pagination, searchQuery]);

  const goToPrevPage = useCallback(() => {
    if (pagination.current_page > 1) {
      dispatch(fetchRoles({
        page: pagination.current_page - 1,
        search: searchQuery
      }));
    }
  }, [dispatch, pagination.current_page, searchQuery]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      dispatch(fetchRoles({
        page,
        search: searchQuery
      }));
    }
  }, [dispatch, pagination.last_page, searchQuery]);

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
    pagination,
    currentPage,
    loadRoleUsers,
    resetRole,
    goToNextPage,
    goToPrevPage,
    goToPage,
    handleSearch,
    searchQuery,
    isSearching,
    onSearchChange
  };
}