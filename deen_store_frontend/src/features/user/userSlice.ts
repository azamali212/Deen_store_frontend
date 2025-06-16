// src/store/slices/userSlice.ts
import api from "@/services/api";
import { ErrorResponse, User, UserState } from "@/types/ui";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import Cookies from 'js-cookie';

// Initial state with proper typing
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
};

// Async thunk for fetching users with pagination and search
export const fetchUsers = createAsyncThunk<
    {
        users: [];
        pagination: {
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
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

            return {
                users: response.data.data.data || [],
                pagination: {
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    total: response.data.data.total,
                    per_page: response.data.data.per_page,
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

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        // Clear status messages
        clearMessages(state) {
            state.error = null;
            state.successMessage = null;
        },
        // Set selected user
        setSelectedUser: (state, action: PayloadAction<User | null>) => {
            state.selectedUser = action.payload;
          },
        // Reset to initial state
        resetUserState() {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users cases
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (
                state,
                action: PayloadAction<{
                    users: [];
                    pagination: {
                        current_page: number;
                        last_page: number;
                        total: number;
                        per_page: number;
                    };
                }>
            ) => {
                state.loading = false;
                state.users = action.payload.users;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch users';
            });
    },
});

// Export actions
export const { clearMessages, setSelectedUser, resetUserState } = userSlice.actions;

// Export reducer
export default userSlice.reducer;