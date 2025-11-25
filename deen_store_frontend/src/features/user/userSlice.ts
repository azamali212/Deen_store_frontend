import api from "@/services/api";
import { ErrorResponse, User, UserState, Permission, TemporaryPermissionsResponse, TemporaryPermissionAssignment, TemporaryPermission, ActiveTemporaryPermissionsResponse } from "@/types/ui";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import Cookies from 'js-cookie';
import { reducers, extraReducers } from "./userReducers";

// Extend the initial state to include stats
export const initialState: UserState = {
    users: [],
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        total: 0,
        per_page: 15,
        last_page: 1,
    },
    selectedUserPermissions: [],
    successMessage: null,
    selectedUser: null,
    stats: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        customerUsers: 0
    },
    deletedUsers: {
        data: [],
        loading: false,
        error: null
    },
    temporaryPermissions: {
        active: [],
        all: [],
        loading: false,
        error: null
    }
};

// Async thunk for fetching users with stats
export const fetchUsers = createAsyncThunk<
    {
        users: User[];
        pagination: {
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
        };
        stats: {
            totalUsers: number;
            activeUsers: number;
            inactiveUsers: number;
            adminUsers: number;
            customerUsers: number;
        };
    },
    { page?: number; search?: string; filters?: Record<string, string> },
    { rejectValue: ErrorResponse }
>(
    'users/fetchUsers',
    async ({ page = 1, search = '', filters = {} }, { rejectWithValue }) => {

        try {
            const token = Cookies.get('token');
            const response = await api.get('/users', {

                params: {
                    page,
                    search,
                    per_page: 15,
                    ...filters
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Raw API response:', response.data)

            const meta = response.data.meta || {};

            // Directly use counts from meta
            return {
                users: response.data.data.data || [],
                pagination: {
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    total: response.data.data.total,
                    per_page: response.data.data.per_page,
                },
                stats: {
                    totalUsers: meta.total_users || 0,
                    activeUsers: meta.active_users || 0,
                    inactiveUsers: meta.inactive_users || 0,
                    adminUsers: meta.admin_users || 0,
                    customerUsers: meta.customer_users || 0
                }
            };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ message: 'Failed to fetch users' });
        }
    }
);


export const fetchSingleUser = createAsyncThunk<
    { user: User; permissions: Permission[] }, // Updated return type
    { userId: string; relations?: string },
    { rejectValue: ErrorResponse }
>(
    'users/fetchSingleUser',
    async ({ userId, relations = 'roles,permissions' }, { rejectWithValue }) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const token = Cookies.get('token');
            const response = await api.get(`/users/${userId}`, {
                params: { relations },
                headers: { Authorization: `Bearer ${token}` },
            });

            // Handle different response structures
            let userData;
            if (response.data.data?.original?.data?.user) {
                userData = response.data.data.original.data.user;
            } else if (response.data.data) {
                userData = response.data.data;
            } else {
                userData = response.data;
            }

            if (!userData || !userData.id) {
                throw new Error('Invalid user data structure received');
            }

            return userData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Error fetching single user:', error);
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to fetch user',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: 'Network error while fetching user'
            });
        }
    }
);


// Soft delete user thunk
export const softDeleteUser = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user_id: string;
            user_name: string;
            roles: string[];
        };
    },
    string,
    { rejectValue: ErrorResponse }
>(
    'users/softDeleteUser',
    async (userId, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Make sure the endpoint is correct (changed from /user to /users)
            const response = await api.delete(`/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            // Simplify the response handling
            const responseData = response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to delete user');
            }

            // Refresh users list after deletion
            await dispatch(fetchUsers({ page: 1 }));

            return {
                success: responseData.success,
                message: responseData.message,
                data: responseData.data

            };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to delete user',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while deleting user'
            });
        }
    }
);

//Show Fetch Delete Users 
// Async thunk for fetching soft-deleted users
export const fetchDeletedUsers = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: Array<{
            user_id: string;
            user_name: string;
            roles: string[];
            deleted_at: string;
        }>;
    },
    void,
    { rejectValue: ErrorResponse }
>(
    'users/fetchDeletedUsers',
    async (_, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get(`/user/recycleBinUsers`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to fetch deleted users');
            }

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to fetch deleted users',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while fetching deleted users'
            });
        }
    }
);
export const restoreDeletedUser = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user_id: string;
            user_name: string;
            roles: string[];
        };
    },
    string, // userId as string parameter
    { rejectValue: ErrorResponse }
>(
    'users/restoreDeletedUser',
    async (userId, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Change from POST to GET and remove empty body {}
            const response = await api.get(`/user/restore/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to restore user');
            }

            // Refresh deleted users list after restoration
            dispatch(fetchDeletedUsers());

            return {
                success: responseData.success,
                message: responseData.message,
                data: responseData.data
            };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to restore user',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while restoring user'
            });
        }
    }
);

// Force delete user thunk (permanent deletion)
export const forceDeleteUser = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user_id: string;
            user_name: string;
        };
    },
    string, // userId as string parameter
    { rejectValue: ErrorResponse }
>(
    'users/forceDeleteUser',
    async (userId, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await api.delete(`/user/${userId}/permanentDelete`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Handle the nested response structure
            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to permanently delete user');
            }

            // Refresh both active and deleted users lists
            dispatch(fetchUsers({ page: 1 }));
            dispatch(fetchDeletedUsers());

            return {
                success: responseData.success,
                message: responseData.message,
                data: responseData.data
            };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to permanently delete user',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while permanently deleting user'
            });
        }
    }
);

// Add these new thunks to your existing userSlice.ts file

// Bulk delete soft-deleted users (permanent delete)
export const bulkDeleteSoftDeletedUsers = createAsyncThunk<
    {
        success: boolean;
        message: string;
        deleted_count: number;
        failed_ids: string[];
    },
    string[], // Array of user IDs
    { rejectValue: ErrorResponse }
>(
    'users/bulkDeleteSoftDeletedUsers',
    async (userIds, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post('/users/recycle-bin/bulk-delete', {
                user_ids: userIds
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to bulk delete users');
            }

            // Refresh deleted users list
            dispatch(fetchDeletedUsers());

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to bulk delete users',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while bulk deleting users'
            });
        }
    }
);

// Restore all soft-deleted users
export const restoreAllDeletedUsers = createAsyncThunk<
    {
        success: boolean;
        message: string;
        restored_count: number;
        failed_ids: string[];
    },
    void,
    { rejectValue: ErrorResponse }
>(
    'users/restoreAllDeletedUsers',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post('/users/recycle-bin/restore-all', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to restore all users');
            }

            // Ensure the response has all required fields
            const result = {
                success: responseData.success,
                message: responseData.message,
                restored_count: responseData.restored_count || 0,
                failed_ids: responseData.failed_ids || []
            };

            // Refresh both active and deleted users lists
            dispatch(fetchUsers({ page: 1 }));
            dispatch(fetchDeletedUsers());

            return result;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to restore all users',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while restoring all users'
            });
        }
    }
);

// Add these thunks after your existing thunks in userSlice.ts

export const deactivateUser = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user_id: string;
            status: string;
        };
    },
    { userId: string; reason?: string },
    { rejectValue: ErrorResponse }
>(
    'users/deactivateUser',
    async ({ userId, reason }, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post(`/users/${userId}/deactivate`,
                { reason },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to deactivate user');
            }

            // Refresh users list after deactivation
            await dispatch(fetchUsers({ page: 1 }));

            return {
                success: responseData.success,
                message: responseData.message,
                data: responseData.data
            };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to deactivate user',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while deactivating user'
            });
        }
    }
);

export const activateUser = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user_id: string;
            status: string;
        };
    },
    { userId: string; reason?: string },
    { rejectValue: ErrorResponse }
>(
    'users/activateUser',
    async ({ userId, reason }, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post(`/users/${userId}/activate`,
                { reason },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to activate user');
            }

            // Refresh users list after activation
            await dispatch(fetchUsers({ page: 1 }));

            return {
                success: responseData.success,
                message: responseData.message,
                data: responseData.data
            };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to activate user',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while activating user'
            });
        }
    }
);

//Assgin Role to User Assgin Role To user and Sync and revoke Role
// Assign roles to user
export const assignRolesToUser = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                name: string;
                email: string;
            };
            roles: string[];
        };
    },
    { userId: string; roles: string[]; sync?: boolean },
    { rejectValue: ErrorResponse }
>(
    'users/assignRolesToUser',
    async ({ userId, roles, sync = true }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post(`/users/${userId}/roles`, {
                roles,
                sync
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to assign roles');
            }

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to assign roles',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while assigning roles'
            });
        }
    }
);

// features/user/userSlice.ts
// features/user/userSlice.ts
export const syncUserRoles = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user_id: string;
            user_name: string;
            previous_roles: string[];
            new_roles: string[];
            final_roles: string[];
            sync_mode: string;
            roles: string[];
        };
    },
    { userId: string; roles: string[]; sync: boolean },
    { rejectValue: ErrorResponse }
>(
    'users/syncUserRoles',
    async ({ userId, roles, sync }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post(`/user/${userId}/sync-roles`, {
                roles,
                sync
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Sync roles API response:', response.data);

            // Handle empty response
            if (!response.data || Object.keys(response.data).length === 0) {
                // Return a mock response structure for empty responses
                return {
                    success: true,
                    message: 'Roles synced successfully',
                    data: {
                        user_id: userId,
                        user_name: 'User',
                        previous_roles: [],
                        new_roles: roles,
                        final_roles: roles,
                        sync_mode: sync ? 'replace' : 'add',
                        roles: roles
                    }
                };
            }

            const responseData = response.data;

            if (responseData.success === false) {
                throw new Error(responseData.message || 'Failed to sync roles');
            }

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Sync roles error:', error.response?.data || error.message);

            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to sync roles',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while syncing roles'
            });
        }
    }
);

// Remove roles from user
export const removeRolesFromUser = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user: User;
            remaining_roles: string[];
        };
    },
    { userId: string; roles: string[] },
    { rejectValue: ErrorResponse }
>(
    'users/removeRolesFromUser',
    async ({ userId, roles }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.delete(`/users/${userId}/roles`, {
                data: { roles },
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to remove roles');
            }

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to remove roles',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while removing roles'
            });
        }
    }
);

// Change user role
export const changeUserRole = createAsyncThunk<
    {
        success: boolean;
        message: string;
        data: {
            user: User;
            new_role: string;
        };
    },
    { userId: string; newRole: string },
    { rejectValue: ErrorResponse }
>(
    'users/changeUserRole',
    async ({ userId, newRole }, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.patch(`/user/${userId}/userRole`, {
                role: newRole
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to change user role');
            }

            // Refresh user details to get updated roles
            await dispatch(fetchSingleUser({ userId, relations: 'roles,permissions' }));

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to change user role',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while changing user role'
            });
        }
    }
);

//Permission Settings for User
export const assignTemporaryPermissions = createAsyncThunk<
  TemporaryPermissionsResponse,
  {
    userId: string;
    permissions: TemporaryPermissionAssignment[];
    reason?: string;
  },
  { rejectValue: ErrorResponse }
>(
  'users/assignTemporaryPermissions',
  async ({ userId, permissions, reason }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      // FIX: The component now sends the correct structure
      // Just use the first permission object (they should all be the same)
      const permissionNames = permissions[0]?.permissions || [];
      
      //console.log('🔍 DEBUG - In Redux slice - permissionNames:', permissionNames);
      //console.log('🔍 DEBUG - In Redux slice - type of first element:', typeof permissionNames[0]);
      //console.log('🔍 DEBUG - In Redux slice - first element:', permissionNames[0]);
      
      const payload = {
        permissions: permissionNames, // Array of permission names
        expires_at: permissions[0]?.expires_at,
        reason: reason || permissions[0]?.reason || 'Temporary access'
      };

      console.log('🔍 DEBUG - Final payload to backend:', payload);

      const response = await api.post(`/users/${userId}/temporary-permissions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseData = response.data.data?.original || response.data;

      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to assign temporary permissions');
      }

      return responseData;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      if (error.response) {
        return rejectWithValue({
          message: error.response.data?.message || 'Failed to assign temporary permissions',
          details: error.response.data?.details
        });
      }
      return rejectWithValue({
        message: (err as Error).message || 'Network error while assigning temporary permissions'
      });
    }
  }
);

// Revoke temporary permissions
export const revokeTemporaryPermissions = createAsyncThunk<
    TemporaryPermissionsResponse,
    {
        userId: string;
        permissions: string[];
        reason?: string;
    },
    { rejectValue: ErrorResponse }
>(
    'users/revokeTemporaryPermissions',
    async ({ userId, permissions, reason }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post(`/users/${userId}/revoke-permissions`, {
                permissions,
                reason
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to revoke temporary permissions');
            }

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to revoke temporary permissions',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while revoking temporary permissions'
            });
        }
    }
);

// Get user's temporary permissions
export const getTemporaryPermissions = createAsyncThunk<
    {
        success: boolean;
        data: {
            active_temporary_permissions: TemporaryPermission[];
            all_temporary_permissions: TemporaryPermission[];
        };
    },
    string, // userId
    { rejectValue: ErrorResponse }
>(
    'users/getTemporaryPermissions',
    async (userId, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get(`/users/${userId}/get-temporary-permissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to fetch temporary permissions');
            }

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to fetch temporary permissions',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while fetching temporary permissions'
            });
        }
    }
);

// Get active temporary permissions only
export const getActiveTemporaryPermissions = createAsyncThunk<
    ActiveTemporaryPermissionsResponse,
    string, // userId
    { rejectValue: ErrorResponse }
>(
    'users/getActiveTemporaryPermissions',
    async (userId, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get(`/users/${userId}/get-active-temporaryPermission`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to fetch active temporary permissions');
            }

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to fetch active temporary permissions',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while fetching active temporary permissions'
            });
        }
    }
);

// Clean up expired temporary permissions
export const cleanupExpiredTemporaryPermissions = createAsyncThunk<
    {
        success: boolean;
        message: string;
        cleaned_count?: number;
    },
    void,
    { rejectValue: ErrorResponse }
>(
    'users/cleanupExpiredTemporaryPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get('/users/cleaenup-temporary-permissions', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to cleanup expired permissions');
            }

            return responseData;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Failed to cleanup expired permissions',
                    details: error.response.data?.details
                });
            }
            return rejectWithValue({
                message: (err as Error).message || 'Network error while cleaning up expired permissions'
            });
        }
    }
);


const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: reducers,
    extraReducers: (builder) => {
        extraReducers(builder);
    }
});


export const { clearMessages, setSelectedUser, resetUserState, setSelectedUserPermissions, clearTemporaryPermissionsError,
    clearTemporaryPermissions } = userSlice.actions;
export default userSlice.reducer;