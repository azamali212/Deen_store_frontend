import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
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
} from '@/types/ui';

const initialState: RoleState = {
    roles: [],
    selectedRole: null,
    loading: false,
    error: null,
    successMessage: null,
};

// Fetch all roles
export const fetchRoles = createAsyncThunk<PaginatedRoleResponse, void, { rejectValue: ErrorResponse }>(
    'role/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get('/role', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data; // This is the full object { current_page, data, total, ... }
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Fetch roles failed' });
        }
    }
);

// Show specific role
export const fetchRole = createAsyncThunk<RoleResponse, number, { rejectValue: ErrorResponse }>(
    'role/fetchOne',
    async (id, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post(`/role/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Fetch role failed' });
        }
    }
);

// Create a new role
export const createRole = createAsyncThunk<RoleResponse, RolePayload, { rejectValue: ErrorResponse }>(
    'role/create',
    async (data, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post('/role/create', data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Create role failed' });
        }
    }
);

// Update role
export const updateRole = createAsyncThunk<RoleResponse, { id: number; data: RolePayload }, { rejectValue: ErrorResponse }>(
    'role/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.put(`/role/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Update role failed' });
        }
    }
);

// Delete role
export const deleteRole = createAsyncThunk<void, number, { rejectValue: ErrorResponse }>(
    'role/delete',
    async (id, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            await api.delete(`/role/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Delete role failed' });
        }
    }
);

// Attach permissions to role
export const attachPermissions = createAsyncThunk<void, PermissionAttachPayload, { rejectValue: ErrorResponse }>(
    'role/attachPermissions',
    async ({ id, permissions }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            await api.post(`/roles/${id}/permissions`, { permissions }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Attach permissions failed' });
        }
    }
);

// Detach permissions
export const detachPermissions = createAsyncThunk<void, PermissionAttachPayload, { rejectValue: ErrorResponse }>(
    'role/detachPermissions',
    async ({ id, permissions }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            await api.post(`/roles/${id}/permissions/detach`, { permissions }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Detach permissions failed' });
        }
    }
);

// Attach users
export const attachUsers = createAsyncThunk<void, RoleUserAttachPayload, { rejectValue: ErrorResponse }>(
    'role/attachUsers',
    async ({ id, users }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            await api.post(`/roles/${id}/attach-users`, { users }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Attach users failed' });
        }
    }
);

// Detach users
export const detachUsers = createAsyncThunk<void, RoleUserAttachPayload, { rejectValue: ErrorResponse }>(
    'role/detachUsers',
    async ({ id, users }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            await api.post(`/roles/${id}/detach`, { users }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Detach users failed' });
        }
    }
);

// Fetch permissions of a role
export const fetchRolePermissions = createAsyncThunk<string[], number, { rejectValue: ErrorResponse }>(
    'role/fetchRolePermissions',
    async (id, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get(`/roles/${id}/permissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.permissions; // Adjust based on API response shape
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Fetch role permissions failed' });
        }
    }
);

// Fetch users of a role
export const fetchRoleUsers = createAsyncThunk<number[], number, { rejectValue: ErrorResponse }>(
    'role/fetchRoleUsers',
    async (id, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get(`/roles/${id}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.users; // Adjust based on API response shape
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Fetch role users failed' });
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
            .addCase(fetchRolePermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.rolePermissions = action.payload;
                state.error = null;
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
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to load roles';
            })
            .addCase(fetchRole.fulfilled, (state, action) => {
                state.selectedRole = action.payload.role;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.roles.push(action.payload.role);
                state.successMessage = 'Role created successfully';
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                const index = state.roles.findIndex((r) => r.id === action.payload.role.id);
                if (index !== -1) state.roles[index] = action.payload.role;
                state.successMessage = 'Role updated successfully';
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.roles = state.roles.filter((r) => r.id !== action.meta.arg);
                state.successMessage = 'Role deleted successfully';
            });

    },
});

export const { resetRoleState } = roleSlice.actions;
export default roleSlice.reducer;