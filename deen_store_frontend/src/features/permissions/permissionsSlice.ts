"use client";
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { AuthStorage } from '@/core/auth/auth.storage';
import { Permission, PermissionState, ErrorResponse, BulkDeleteResponse, PermissionDistribution } from '@/types/ui';
import { publicApi } from '@/services/api.public';

const initialState: PermissionState = {
    permissions: [],
    loading: false,
    error: null,
    successMessage: null,
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15
    },
    distribution: {
        data: [],
        loading: false,
        error: null
    }
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

// Async thunk to fetch permissions - UPDATED with portal support
export const fetchPermissions = createAsyncThunk<
    {
        data: Permission[];
        current_page: number;
        last_page: number;
        total: number;
    },
    { page?: number; per_page?: number; portal?: 'admin' | 'customer' },
    { rejectValue: string }
>(
    'permissions/fetchPermissions',
    async (params = {}, { rejectWithValue }) => {
        const { page = 1, per_page = 15, portal = 'admin' } = params;
        
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.get('/permission', {
                params: { page, per_page },
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Fetch permissions error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch permissions'
            );
        }
    }
);

// Async thunk to create a permission - UPDATED
export const createPermission = createAsyncThunk<
    Permission,
    { name: string; guard_name?: string; portal?: 'admin' | 'customer' },
    { rejectValue: string }
>(
    'permissions/createPermission',
    async (permissionData, { rejectWithValue }) => {
        const portal = permissionData.portal || 'admin';
        
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.post('/permission', permissionData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Create permission error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create permission'
            );
        }
    }
);

// Async thunk to export permissions to Excel - UPDATED
export const exportPermissionsToExcel = createAsyncThunk<
    void,
    { portal?: 'admin' | 'customer' } | void,
    { rejectValue: string }
>(
    'permissions/exportPermissionsToExcel',
    async (params = {}, { rejectWithValue }) => {
        const portal = (params as { portal?: 'admin' | 'customer' })?.portal || 'admin';
        
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.get('/permissions/export', {
                responseType: 'blob',
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });

            // Create download link directly
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'permissions_export.xlsx');
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            return;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Export permissions error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to export permissions'
            );
        }
    }
);

// Async thunk to import permissions from Excel - UPDATED
export const importPermissionsFromExcel = createAsyncThunk<
    {
        imported: number;
        skipped: number;
        message: string;
    },
    { formData: FormData; portal?: 'admin' | 'customer' },
    { rejectValue: string }
>(
    'permissions/importPermissionsFromExcel',
    async ({ formData, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.post('/permissions/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            return {
                imported: response.data.data.imported,
                skipped: response.data.data.skipped,
                message: response.data.message
            };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Import permissions error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            if (error.response?.status === 422) {
                // Handle validation errors
                const errors = error.response.data?.errors || [];
                return rejectWithValue(
                    errors.join(', ') || 'Invalid file format or data'
                );
            }
            
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'Failed to import permissions'
            );
        }
    }
);

// Async thunk to bulk delete and Single delete permissions - UPDATED
export const bulkDeletePermissions = createAsyncThunk<
    BulkDeleteResponse,
    { ids: number[]; soft_delete?: boolean; portal?: 'admin' | 'customer' },
    { rejectValue: string }
>(
    'permissions/bulkDelete',
    async ({ ids, soft_delete = false, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.delete('/permissions/delete-multiple', {
                data: {
                    ids: ids,
                    soft_delete: soft_delete
                },
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: response.data.success,
                message: response.data.message,
                data: {
                    ids: ids,
                    deleted_count: response.data.data.deleted_count,
                    failed_ids: response.data.data.failed_ids || [],
                    skipped_ids: response.data.data.skipped_ids || []
                }
            };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Bulk delete permissions error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            if (error.response?.status === 422) {
                return rejectWithValue(
                    'Invalid data format. Please check the IDs and try again.'
                );
            }
            
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete permissions'
            );
        }
    }
);

// Update permission action - UPDATED
export const updatePermissionAction = createAsyncThunk<
    Permission,
    { id: number; data: { name: string; slug: string }; portal?: 'admin' | 'customer' },
    { rejectValue: string }
>(
    'permissions/updatePermissionAction',
    async ({ id, data, portal = 'admin' }, { rejectWithValue }) => {
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.put(`/permission/${id}`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.permission;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Update permission error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update permission'
            );
        }
    }
);

// Fetch permission distribution - UPDATED (FIXED)
export const fetchPermissionDistribution = createAsyncThunk<
    PermissionDistribution[],
    { portal?: 'admin' | 'customer' } | void,
    { rejectValue: string }
>(
    'permissions/fetchDistribution',
    async (params = {}, { rejectWithValue }) => {
        // Handle both object and no-parameter calls
        const portal = (params as { portal?: 'admin' | 'customer' })?.portal || 'admin';
        
        try {
            const token = getToken(portal);
            
            if (!token) {
                handleAuthError(portal);
                throw new Error('No authentication token found');
            }
            
            const response = await publicApi.get('/permissions/distribution', {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data.permissions;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            console.error('Fetch permission distribution error:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                handleAuthError(portal);
            }
            
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch permission distribution'
            );
        }
    }
);

const permissionsSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        clearMessages(state) {
            state.error = null;
            state.successMessage = null;
        },
        clearAuthError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create permission
            .addCase(createPermission.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createPermission.fulfilled, (state, action: PayloadAction<Permission>) => {
                state.loading = false;
                state.permissions.push(action.payload);
                state.successMessage = 'Permission created successfully';
            })
            .addCase(createPermission.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload || 'Failed to create permission';
                if (errorMessage.toLowerCase().includes('authentication') || 
                    errorMessage.toLowerCase().includes('token') ||
                    errorMessage.toLowerCase().includes('unauthorized')) {
                    state.error = 'Session expired. Please login again.';
                } else {
                    state.error = errorMessage;
                }
            })
            
            // Fetch permissions
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchPermissions.fulfilled,
                (
                    state,
                    action: PayloadAction<{
                        data: Permission[];
                        current_page: number;
                        last_page: number;
                        total: number;
                    }>
                ) => {
                    state.loading = false;
                    state.permissions = action.payload.data;
                    state.pagination = {
                        current_page: action.payload.current_page,
                        last_page: action.payload.last_page,
                        total: action.payload.total,
                        per_page: 15
                    };
                    state.error = null;
                }
            )
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload || 'Failed to fetch permissions';
                if (errorMessage.toLowerCase().includes('authentication') || 
                    errorMessage.toLowerCase().includes('token') ||
                    errorMessage.toLowerCase().includes('unauthorized')) {
                    state.error = 'Session expired. Please login again.';
                } else {
                    state.error = errorMessage;
                }
            })
            
            // Export to Excel
            .addCase(exportPermissionsToExcel.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(exportPermissionsToExcel.fulfilled, (state) => {
                state.loading = false;
                state.successMessage = 'Permissions exported successfully';
            })
            .addCase(exportPermissionsToExcel.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload || 'Failed to export permissions';
                if (errorMessage.toLowerCase().includes('authentication') || 
                    errorMessage.toLowerCase().includes('token') ||
                    errorMessage.toLowerCase().includes('unauthorized')) {
                    state.error = 'Session expired. Please login again.';
                } else {
                    state.error = errorMessage;
                }
            })
            
            // Bulk delete permissions
            .addCase(bulkDeletePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(bulkDeletePermissions.fulfilled, (state, action: PayloadAction<BulkDeleteResponse>) => {
                state.loading = false;

                if (action.payload.success) {
                    const deletedIds = action.payload.data?.ids || [];
                    state.permissions = state.permissions.filter(
                        perm => !deletedIds.includes(perm.id)
                    );

                    // Update pagination totals
                    if (state.pagination) {
                        state.pagination.total = Math.max(
                            0,
                            state.pagination.total - (action.payload.data?.deleted_count || 0)
                        );

                        // Recalculate last page if needed
                        const perPage = state.pagination.per_page || 15;
                        state.pagination.last_page = Math.ceil(state.pagination.total / perPage);

                        // Adjust current page if we're now beyond last page
                        if (state.pagination.current_page > state.pagination.last_page) {
                            state.pagination.current_page = Math.max(1, state.pagination.last_page);
                        }
                    }

                    state.successMessage = action.payload.message;
                }
                state.error = null;
            })
            .addCase(bulkDeletePermissions.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload || 'Failed to delete permissions';
                if (errorMessage.toLowerCase().includes('authentication') || 
                    errorMessage.toLowerCase().includes('token') ||
                    errorMessage.toLowerCase().includes('unauthorized')) {
                    state.error = 'Session expired. Please login again.';
                } else {
                    state.error = errorMessage;
                }
            })
            
            // Update permission
            .addCase(updatePermissionAction.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updatePermissionAction.fulfilled, (state, action: PayloadAction<Permission>) => {
                state.loading = false;
                state.permissions = state.permissions.map(perm =>
                    perm.id === action.payload.id ? action.payload : perm
                );
                state.successMessage = 'Permission updated successfully';
                state.error = null;
            })
            .addCase(updatePermissionAction.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload || 'Failed to update permission';
                if (errorMessage.toLowerCase().includes('authentication') || 
                    errorMessage.toLowerCase().includes('token') ||
                    errorMessage.toLowerCase().includes('unauthorized')) {
                    state.error = 'Session expired. Please login again.';
                } else {
                    state.error = errorMessage;
                }
            })
            
            // Import from Excel
            .addCase(importPermissionsFromExcel.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(importPermissionsFromExcel.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                state.error = null;
            })
            .addCase(importPermissionsFromExcel.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload || 'Failed to import permissions';
                if (errorMessage.toLowerCase().includes('authentication') || 
                    errorMessage.toLowerCase().includes('token') ||
                    errorMessage.toLowerCase().includes('unauthorized')) {
                    state.error = 'Session expired. Please login again.';
                } else {
                    state.error = errorMessage;
                }
            })
            
            // Fetch permission distribution
            .addCase(fetchPermissionDistribution.pending, (state) => {
                state.distribution.loading = true;
                state.distribution.error = null;
            })
            .addCase(fetchPermissionDistribution.fulfilled, (state, action: PayloadAction<PermissionDistribution[]>) => {
                state.distribution.loading = false;
                state.distribution.data = action.payload;
                state.distribution.error = null;
            })
            .addCase(fetchPermissionDistribution.rejected, (state, action) => {
                state.distribution.loading = false;
                const errorMessage = action.payload || 'Failed to fetch distribution';
                if (errorMessage.toLowerCase().includes('authentication') || 
                    errorMessage.toLowerCase().includes('token') ||
                    errorMessage.toLowerCase().includes('unauthorized')) {
                    state.distribution.error = 'Session expired. Please login again.';
                } else {
                    state.distribution.error = errorMessage;
                }
            });
    },
});

export const { clearMessages, clearAuthError } = permissionsSlice.actions;
export default permissionsSlice.reducer;