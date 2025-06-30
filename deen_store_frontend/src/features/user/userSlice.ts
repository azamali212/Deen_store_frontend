import api from "@/services/api";
import { ErrorResponse, User, UserState } from "@/types/ui";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import Cookies from 'js-cookie';

// Extend the initial state to include stats
const initialState: UserState = {
    users: [],
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        total: 0,
        per_page: 15,
        last_page: 1,
    },
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
    User,
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
    string, // userId as string parameter
    { rejectValue: ErrorResponse }
>(
    'users/softDeleteUser',
    async (userId, { rejectWithValue, dispatch }) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await api.delete(`/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Handle the nested response structure
            const responseData = response.data.data?.original || response.data;

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to delete user');
            }

            // Refresh users list after deletion
            dispatch(fetchUsers({ page: 1 }));

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
            const response = await api.get('/user/recycleBinUsers', {
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
//Restore Deleted User
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

            const response = await api.post(`/user/restore/${userId}`, {}, {
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
)

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


const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearMessages(state) {
            state.error = null;
            state.successMessage = null;
        },
        setSelectedUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
        },
        resetUserState() {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                // Only update what changed
                state.users = action.payload.users;
                state.pagination = action.payload.pagination;
                state.stats = action.payload.stats;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch users';
            })
            .addCase(fetchSingleUser.pending, (state) => {
                state.loading = true;
                state.selectedUser = null;
            })
            .addCase(fetchSingleUser.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchSingleUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch user';
            })
            .addCase(softDeleteUser.pending, (state) => {
                state.loading = true;
                state.successMessage = null;
                state.error = null;
            })
            .addCase(softDeleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                // Remove the deleted user from the local state
                state.users = state.users.filter(user => user.id !== action.payload.data.user_id);
                // Update stats if needed
                if (state.stats.totalUsers > 0) {
                    state.stats.totalUsers -= 1;
                }
            })
            .addCase(softDeleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete user';
            })
            .addCase(fetchDeletedUsers.pending, (state) => {
                state.deletedUsers.loading = true;
                state.deletedUsers.error = null;
            })
            .addCase(fetchDeletedUsers.fulfilled, (state, action) => {
                state.deletedUsers.loading = false;
                state.deletedUsers.data = action.payload.data;
            })
            .addCase(fetchDeletedUsers.rejected, (state, action) => {
                state.deletedUsers.loading = false;
                state.deletedUsers.error = action.payload?.message || 'Failed to fetch deleted users';
            })
            .addCase(restoreDeletedUser.pending, (state) => {
                state.deletedUsers.loading = true;
                state.successMessage = null;
                state.error = null;
            })
            .addCase(restoreDeletedUser.fulfilled, (state, action) => {
                state.deletedUsers.loading = false;
                state.successMessage = action.payload.message;
                // Remove the restored user from the deleted users list
                state.deletedUsers.data = state.deletedUsers.data.filter(
                    user => user.user_id !== action.payload.data.user_id
                );
            })
            .addCase(restoreDeletedUser.rejected, (state, action) => {
                state.deletedUsers.loading = false;
                state.error = action.payload?.message || 'Failed to restore user';
            })
            .addCase(forceDeleteUser.pending, (state) => {
                state.deletedUsers.loading = true;
                state.successMessage = null;
                state.error = null;
            })
            .addCase(forceDeleteUser.fulfilled, (state, action) => {
                state.deletedUsers.loading = false;
                state.successMessage = action.payload.message;
                // Remove the force-deleted user from the deleted users list
                state.deletedUsers.data = state.deletedUsers.data.filter(
                    user => user.user_id !== action.payload.data.user_id
                );
                // Update stats if needed
                if (state.stats.totalUsers > 0) {
                    state.stats.totalUsers -= 1;
                }
            })
            .addCase(forceDeleteUser.rejected, (state, action) => {
                state.deletedUsers.loading = false;
                state.error = action.payload?.message || 'Failed to permanently delete user';
            });
    },
});

export const { clearMessages, setSelectedUser, resetUserState } = userSlice.actions;
export default userSlice.reducer;