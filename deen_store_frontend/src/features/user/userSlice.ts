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
            });
    },
});

export const { clearMessages, setSelectedUser, resetUserState } = userSlice.actions;
export default userSlice.reducer;