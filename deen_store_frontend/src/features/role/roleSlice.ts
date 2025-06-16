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
    RolePermissionsResponse,
    Permission,
    PaginatedUserResponse,
    ErrorDetails,
} from '@/types/ui';

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

// Fetch all roles
export const fetchRoles = createAsyncThunk<PaginatedRoleResponse, { page?: number; search?: string }, { rejectValue: ErrorResponse }>(
    'role/fetchAll',
    async ({ page = 1, search }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get('/role', {
                params: {
                    page,
                    search,
                    per_page: 15
                },
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
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
            const response = await api.post('/role/create', {
                name: data.name,
                slug: data.slug,
                permission_names: data.permission_names, // Send permission names
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Create role failed' });
        }
    }
);


// Update role SLice
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
export const attachPermissions = createAsyncThunk<Role, PermissionAttachPayload, { rejectValue: ErrorResponse }>(
    'role/attachPermissions',
    async ({ id, permissions }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post<{ role: Role }>(
                `/roles/${id}/permissions`,
                { permission_names: permissions },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.role; // Return the updated role
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || {
                message: 'Attach permissions failed',
                details: error.message
            });
        }
    }
);


// Detach permissions
export const detachPermissions = createAsyncThunk<Role, PermissionAttachPayload, { rejectValue: ErrorResponse }>(
    'role/detachPermissions',
    async ({ id, permissions }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post<{ role: Role }>(
                `/roles/${id}/permissions/detach`,
                { permissions },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data.role; // Return the updated role
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Detach permissions failed' });
        }
    }
);


// Update attachUsers in your roleSlice
export const attachUsers = createAsyncThunk<void, RoleUserAttachPayload, { rejectValue: ErrorResponse }>(
    'role/attachUsers',
    async ({ id, users }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post(`/roles/${id}/attach-users`, {
                user_ids: users,
                role_id: id
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Attach users failed' });
        }
    }
);


// Update detachUsers in your roleSlice
export const detachUsers = createAsyncThunk<void, RoleUserAttachPayload, { rejectValue: ErrorResponse }>(
    'role/detachUsers',
    async ({ id, users }, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.post(`/roles/${id}/detach`, {
                user_ids: users
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Detach users failed' });
        }
    }
);


// Fetch permissions of a role
export const fetchRolePermissions = createAsyncThunk<Permission[], number, { rejectValue: ErrorResponse }>(
    'role/fetchRolePermissions',
    async (id, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get<RolePermissionsResponse>(`/roles/${id}/permissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.data; // Return the permissions array from the response
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch role permissions' });
        }
    }
);


// Fetch users of a role
export const fetchRoleUsers = createAsyncThunk<PaginatedUserResponse, number, { rejectValue: ErrorResponse }>(
    'role/fetchRoleUsers',
    async (id, { rejectWithValue }) => {
        try {
            const token = Cookies.get('token');
            const response = await api.get(`/roles/${id}/users`);
            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Fetch role users failed' });
        }
    }
);


//Delete Multiple Roles
export const deleteMultipleRoles = createAsyncThunk<void, number[], { rejectValue: ErrorDetails }>(
    'role/deleteMultiple',
    async (ids, { rejectWithValue }) => {
      try {
        const token = Cookies.get('token');
        await api.delete('/roles/destroy-multiple', {
          headers: { Authorization: `Bearer ${token}` },
          data: { role_ids: ids }
        });
      } catch (err) {
        const error = err as AxiosError<ErrorDetails>;
        return rejectWithValue({
          message: error.response?.data?.message || 'Delete multiple roles failed',
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
                state.roles = state.roles.filter((r) => r.id !== action.meta.arg);
                state.successMessage = 'Role deleted successfully';
            })// Add these cases to your roleSlice's extraReducers
            .addCase(attachUsers.pending, (state) => {
                state.loading = true;
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