"use client";
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api'; // your axios instance or API helper
import axios, { AxiosError } from 'axios';
import { Permission, PermissionState, ErrorResponse, BulkDeleteResponse, PermissionDistribution } from '@/types/ui';

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

//Async thunk to fetch permissions
export const fetchPermissions = createAsyncThunk<
    {
        data: Permission[];
        current_page: number;
        last_page: number;
        total: number;
    },
    { page?: number; per_page?: number },
    { rejectValue: string }
>(
    'permissions/fetchPermissions',
    async ({ page = 1, per_page = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get('/permission', {
                params: { page, per_page },
            });
            // Assuming backend response structure: { data: { data: [...], current_page, last_page, total } }
            return response.data.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(
                    err.response?.data?.error || err.message || 'Failed to fetch permissions'
                );
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

// Async thunk to create a permission
export const createPermission = createAsyncThunk<
    Permission,
    { name: string; guard_name?: string },
    { rejectValue: string }
>(
    'permissions/createPermission',
    async (permissionData, { rejectWithValue }) => {
        try {
            const response = await api.post('/permission', permissionData);
            return response.data.data;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(
                    err.response?.data?.error || err.message || 'Failed to create permission'
                );
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

// Async thunk to export permissions to Excel
export const exportPermissionsToExcel = createAsyncThunk<
    void, // No return payload needed
    void,
    { rejectValue: string }
>(
    'permissions/exportPermissionsToExcel',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/permissions/export', {
                responseType: 'blob' // This is crucial
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

            return; // No payload needed
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(
                    err.response?.data?.error || err.message || 'Failed to export permissions'
                );
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

export const importPermissionsFromExcel = createAsyncThunk<
    {
        imported: number;
        skipped: number;
        message: string;
    },
    FormData, // Expecting FormData with the file
    { rejectValue: string }
>(
    'permissions/importPermissionsFromExcel',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/permissions/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return {
                imported: response.data.data.imported,
                skipped: response.data.data.skipped,
                message: response.data.message
            };
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    // Handle validation errors
                    const errors = err.response.data?.errors || [];
                    return rejectWithValue(
                        errors.join(', ') || 'Invalid file format or data'
                    );
                }
                return rejectWithValue(
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to import permissions'
                );
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

// Async thunk to bulk delete and Single delete permissions
export const bulkDeletePermissions = createAsyncThunk<
    BulkDeleteResponse,
    { ids: number[]; soft_delete?: boolean },
    { rejectValue: string }
>(
    'permissions/bulkDelete',
    async ({ ids, soft_delete = false }, { rejectWithValue }) => {
        try {
            // Use the plural endpoint that matches your backend
            const response = await api.delete('/permissions/delete-multiple', {
                data: {
                    ids: ids,
                    soft_delete: soft_delete
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
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    return rejectWithValue(
                        'Invalid data format. Please check the IDs and try again.'
                    );
                }
                return rejectWithValue(
                    err.response?.data?.error || err.message || 'Failed to delete permissions'
                );
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);

//Update permission action
export const updatePermissionAction = createAsyncThunk<
    Permission,
    { id: number; data: { name: string; slug: string } },
    { rejectValue: string }
>(
    'permissions/updatePermissionAction',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/permission/${id}`, data);
            return response.data.permission; // Match your API response structure
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(
                    err.response?.data?.error || err.message || 'Failed to update permission'
                );
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
)

export const fetchPermissionDistribution = createAsyncThunk<
    PermissionDistribution[],
    void,
    { rejectValue: string }
>(
    'permissions/fetchDistribution',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/permissions/distribution');
            return response.data.data.permissions;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                return rejectWithValue(
                    err.response?.data?.error || err.message || 'Failed to fetch permission distribution'
                );
            }
            return rejectWithValue('An unknown error occurred');
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
    },
    extraReducers: (builder) => {
        builder
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
                state.error = action.payload || 'Failed to create permission';
            })
            // fetchPermissions cases
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
                    // Store pagination info (optional, adjust your state interface accordingly)
                    state.pagination = {
                        current_page: action.payload.current_page,
                        last_page: action.payload.last_page,
                        total: action.payload.total,
                    };
                }
            )
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch permissions';
            })
            .addCase(exportPermissionsToExcel.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(exportPermissionsToExcel.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = 'Permissions exported successfully';
                // You might want to do something with the file_url here
            })
            .addCase(exportPermissionsToExcel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to export permissions';
            }).addCase(bulkDeletePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(bulkDeletePermissions.fulfilled, (state, action: PayloadAction<BulkDeleteResponse>) => {
                state.loading = false;

                // More robust handling of the response
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
            })
            .addCase(bulkDeletePermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete permissions';
            })
            // Add to your permissionsSlice extraReducers
            .addCase(updatePermissionAction.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updatePermissionAction.fulfilled, (state, action: PayloadAction<Permission>) => {
                state.loading = false;
                // Update the specific permission in the state
                state.permissions = state.permissions.map(perm =>
                    perm.id === action.payload.id ? action.payload : perm
                );
                state.successMessage = 'Permission updated successfully';
            })
            .addCase(updatePermissionAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update permission';
            })
            .addCase(importPermissionsFromExcel.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(importPermissionsFromExcel.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                // Optionally reload permissions after import
                // You might want to dispatch fetchPermissions here or let the UI handle it
            })
            .addCase(importPermissionsFromExcel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to import permissions';
            })
            .addCase(fetchPermissionDistribution.pending, (state) => {
                state.distribution.loading = true;
                state.distribution.error = null;
            })
            .addCase(fetchPermissionDistribution.fulfilled, (state, action: PayloadAction<PermissionDistribution[]>) => {
                state.distribution.loading = false;
                state.distribution.data = action.payload;
            })
            .addCase(fetchPermissionDistribution.rejected, (state, action) => {
                state.distribution.loading = false;
                state.distribution.error = action.payload || 'Failed to fetch distribution';
            });
    },
});

export const { clearMessages } = permissionsSlice.actions;
export default permissionsSlice.reducer;