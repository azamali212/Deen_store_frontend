"use client";
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api'; // your axios instance or API helper
import axios, { AxiosError } from 'axios';
import { Permission, PermissionState, ErrorResponse } from '@/types/ui';

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
            });
    },
});

export const { clearMessages } = permissionsSlice.actions;
export default permissionsSlice.reducer;