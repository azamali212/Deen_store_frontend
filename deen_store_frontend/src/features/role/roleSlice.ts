import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import Cookies from 'js-cookie';
import {
    RoleState,
    Role,
    RolePayload,
    RoleResponse,
    ErrorResponse,
    PermissionAttachPayload,
    RoleUserAttachPayload,
    PaginatedRoleResponse,
    RolePermissionsResponse,
    Permission,
    PaginatedUserResponse,
    ErrorDetails,
} from '@/types/ui';
import { createAuthApiClient } from '@/services/api';
import { publicApi } from '@/services/api.public';
import { AuthStorage } from '@/core/auth/auth.storage';

const initialState: RoleState = {
    roles: [],
    selectedRole: null,
    loading: false,
    error: null,
    successMessage: null,
    rolePermissions: [],
    pagination: {
        current_page: 1,
        total: 0,
        per_page: 15,
        last_page: 1,
    },
};

// Helper function to get token with portal support
const getToken = (portal: 'admin' | 'customer' = 'admin'): string | null => {
    // Try AuthStorage first
    const authStorageToken = AuthStorage.getAccessToken(portal);
    if (authStorageToken) return authStorageToken;
    
    // Try portal-specific cookies
    const portalToken = Cookies.get(`${portal}_access_token`);
    if (portalToken) return portalToken;
    
    // Try generic token
    const genericToken = Cookies.get('token');
    if (genericToken) return genericToken;
    
    // Last resort - scan all cookies for tokens
    const allCookies = Cookies.get();
    for (const [key, value] of Object.entries(allCookies)) {
        if (key.includes('access_token') || key.includes('token')) {
            return value;
        }
    }
    
    return null;
};

// Helper to get current portal
const getCurrentPortal = (): 'admin' | 'customer' => {
    if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname.includes('/admin/') || pathname.startsWith('/admin')) {
            return 'admin';
        }
        if (pathname.includes('/customer/') || pathname.startsWith('/customer')) {
            return 'customer';
        }
    }
    
    // Check which token exists
    const adminToken = Cookies.get('admin_access_token');
    const customerToken = Cookies.get('customer_access_token');
    
    if (adminToken) return 'admin';
    if (customerToken) return 'customer';
    
    return 'admin';
};

// Helper to handle auth errors and redirect
const handleAuthError = (portal: 'admin' | 'customer' = 'admin') => {
    AuthStorage.clear(portal);
    Cookies.remove('token');
    Cookies.remove(`${portal}_access_token`);
    
    if (typeof window !== 'undefined') {
        const loginUrl = portal === 'admin' ? '/admin/login' : '/customer/login';
        window.location.href = `${loginUrl}?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
};

// Fetch all roles - UPDATED with portal support
export const fetchRoles = createAsyncThunk<PaginatedRoleResponse, 
    { page?: number; search?: string; portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/fetchAll',
    async ({ page = 1, search, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.get('/role', {
                params: {
                    page,
                    search,
                    per_page: 15
                },
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Fetch roles error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to fetch roles. Please check your authentication.' 
            });
        }
    }
);

// Show specific role - UPDATED
export const fetchRole = createAsyncThunk<RoleResponse, 
    { id: number; portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/fetchOne',
    async ({ id, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.post(`/role/${id}`, null, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Fetch role error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to fetch role. Please check your authentication.' 
            });
        }
    }
);

// Create a new role - UPDATED
export const createRole = createAsyncThunk<RoleResponse, 
    RolePayload & { portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/create',
    async (data, { rejectWithValue }) => {
        try {
            const portal = data.portal || 'admin';
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.post('/role/create', {
                name: data.name,
                slug: data.slug,
                permission_names: data.permission_names,
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Create role error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(data.portal || 'admin');
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to create role. Please check your permissions.' 
            });
        }
    }
);

// Update role - UPDATED
export const updateRole = createAsyncThunk<RoleResponse, 
    { id: number; data: RolePayload; portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/update',
    async ({ id, data, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.put(`/role/${id}`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Update role error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to update role. Please check your permissions.' 
            });
        }
    }
);

// Delete role - UPDATED
export const deleteRole = createAsyncThunk<void, 
    { id: number; portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/delete',
    async ({ id, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            await publicApi.delete(`/role/${id}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Delete role error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to delete role. Please check your permissions.' 
            });
        }
    }
);

// Attach permissions to role - UPDATED
export const attachPermissions = createAsyncThunk<Role, 
    PermissionAttachPayload & { portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/attachPermissions',
    async ({ id, permissions, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.post<{ role: Role }>(
                `/roles/${id}/permissions`,
                { permission_names: permissions },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.role;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Attach permissions error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || {
                message: 'Failed to attach permissions. Please check your permissions.',
                details: error.message
            });
        }
    }
);

// Detach permissions - UPDATED
export const detachPermissions = createAsyncThunk<Role, 
    PermissionAttachPayload & { portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/detachPermissions',
    async ({ id, permissions, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.post<{ role: Role }>(
                `/roles/${id}/permissions/detach`,
                { permissions },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.role;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Detach permissions error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to detach permissions. Please check your permissions.' 
            });
        }
    }
);

// Attach users - UPDATED
export const attachUsers = createAsyncThunk<void, 
    RoleUserAttachPayload & { portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/attachUsers',
    async ({ id, users, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.post(`/roles/${id}/attach-users`, {
                user_ids: users,
                role_id: id
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Attach users error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to attach users. Please check your permissions.' 
            });
        }
    }
);

// Detach users - UPDATED
export const detachUsers = createAsyncThunk<void, 
    RoleUserAttachPayload & { portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/detachUsers',
    async ({ id, users, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.post(`/roles/${id}/detach`, {
                user_ids: users
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Detach users error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to detach users. Please check your permissions.' 
            });
        }
    }
);

// Fetch role permissions - UPDATED
export const fetchRolePermissions = createAsyncThunk<Permission[], 
    { id: number; portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/fetchRolePermissions',
    async ({ id, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.get<RolePermissionsResponse>(`/roles/${id}/permissions`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Fetch role permissions error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to fetch role permissions. Please check your authentication.' 
            });
        }
    }
);

// Fetch role users - UPDATED
export const fetchRoleUsers = createAsyncThunk<PaginatedUserResponse, 
    { id: number; portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorResponse }>(
    'role/fetchRoleUsers',
    async ({ id, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.get(`/roles/${id}/users`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Fetch role users error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(error.response?.data || { 
                message: 'Failed to fetch role users. Please check your authentication.' 
            });
        }
    }
);

// Delete multiple roles - UPDATED
export const deleteMultipleRoles = createAsyncThunk<void, 
    { ids: number[]; portal?: 'admin' | 'customer' }, 
    { rejectValue: ErrorDetails }>(
    'role/deleteMultiple',
    async ({ ids, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            await publicApi.delete('/roles/destroy-multiple', {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: { role_ids: ids }
            });
        } catch (err) {
            const error = err as AxiosError<ErrorDetails>;
            console.error('Delete multiple roles error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue({
                message: error.response?.data?.message || 'Failed to delete multiple roles. Please check your permissions.',
                details: error.response?.data?.details || {}
            });
        }
    }
);

//Create slice
const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        resetRoleState(state) {
            state.error = null;
            state.successMessage = null;
            state.selectedRole = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRolePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRolePermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
                state.loading = false;
                state.rolePermissions = action.payload;
            })
            .addCase(fetchRolePermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch role permissions';
            })
            // fetchRoleUsers
            .addCase(fetchRoleUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoleUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.roleUsers = action.payload;
            })
            .addCase(fetchRoleUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch role users';
            })
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload.data;
                state.pagination = {
                    current_page: action.payload.current_page,
                    total: action.payload.total,
                    per_page: action.payload.per_page,
                    last_page: action.payload.last_page,
                };
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to load roles';
            })
            .addCase(fetchRole.fulfilled, (state, action) => {
                state.selectedRole = action.payload.role;
            })
            .addCase(createRole.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            // In your createRole.fulfilled case:
            .addCase(createRole.fulfilled, (state, action) => {
                state.loading = false;
                const newRole = {
                    ...action.payload.role,
                    permissions: action.payload.permissions || []
                };
                state.roles.push(newRole);
                state.successMessage = 'Role created successfully';
                state.error = null;
            })
            .addCase(createRole.rejected, (state, action) => {
                state.loading = false;
                const error = action.payload;
                if (error?.status === 422) {
                    state.error = 'Invalid data format. Please check your inputs.';
                } else {
                    state.error = error?.message || 'Failed to create role';
                }
                state.successMessage = null;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                const index = state.roles.findIndex((r) => r.id === action.payload.role.id);
                if (index !== -1) state.roles[index] = action.payload.role;
                state.successMessage = 'Role updated successfully';
            })
            .addCase(attachPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(attachPermissions.fulfilled, (state, action: PayloadAction<Role>) => {
                state.loading = false;
                state.successMessage = 'Permissions updated successfully';
                if (state.roles) {
                    const updatedRole = action.payload;
                    state.roles = state.roles.map(role =>
                        role.id === updatedRole.id ? {
                            ...role,
                            permissions: updatedRole.permissions,
                            permissionsCount: updatedRole.permissions?.length || 0
                        } : role
                    );
                }
            })
            .addCase(detachPermissions.fulfilled, (state, action: PayloadAction<Role>) => {
                state.loading = false;
                state.successMessage = 'Permissions updated successfully';
                if (state.roles) {
                    const updatedRole = action.payload;
                    state.roles = state.roles.map(role =>
                        role.id === updatedRole.id ? {
                            ...role,
                            permissions: updatedRole.permissions,
                            permissionsCount: updatedRole.permissions?.length || 0
                        } : role
                    );
                }
            })
            .addCase(attachPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to attach permissions';
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = state.roles.filter((r) => r.id !== action.meta.arg.id);
                if (state.selectedRole?.id === action.meta.arg.id) {
                    state.selectedRole = null;
                }
                state.successMessage = 'Role deleted successfully';
                state.error = null;
            })
            .addCase(attachUsers.fulfilled, (state) => {
                state.loading = false;
                state.successMessage = 'Users attached successfully';
            })
            .addCase(attachUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to attach users';
            })
            .addCase(detachUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(detachUsers.fulfilled, (state) => {
                state.loading = false;
                state.successMessage = 'Users detached successfully';
            })
            .addCase(detachUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to detach users';
            })
            .addCase(deleteMultipleRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
              })
              .addCase(deleteMultipleRoles.fulfilled, (state) => {
                state.loading = false;
                state.successMessage = 'Roles deleted successfully';
                state.lastDeleted = new Date().toISOString();
              })
              .addCase(deleteMultipleRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to Delete Roles';
              })

    },
});

export const { resetRoleState } = roleSlice.actions;
export default roleSlice.reducer;