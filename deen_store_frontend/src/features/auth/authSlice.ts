import  Cookies  from 'js-cookie';
// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { AuthState, LoginPayload, LoginResponse, ErrorResponse } from '../../types/ui';
import { cookies } from 'next/headers';

const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const initialState: AuthState = {
    user: null,
    token: tokenFromStorage,
    loading: false,
    error: null,
    successMessage: null,
    isAuthenticated: !!tokenFromStorage,
    
};

// Async Thunk — Login
// features/auth/authSlice.ts
export const login = createAsyncThunk<LoginResponse, LoginPayload, { rejectValue: ErrorResponse }>(
    'auth/login',
    async (userData, { rejectWithValue }) => {
      try {
        const response = await api.post('/user-login', userData);
        const { token } = response.data;
  
        if (typeof window !== 'undefined') {
          Cookies.set('token', token, {
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
          localStorage.setItem('token', token);
        }
  
        return response.data;
      } catch (err) {
        const error = err as AxiosError<ErrorResponse>;
        return rejectWithValue(error.response?.data || { message: 'Login failed' });
      }
    }
  );

  export const logout = createAsyncThunk<void>(
    'auth/logout',
    async (_, { rejectWithValue }) => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
        if (!token) {
          throw new Error('No token found');
        }
  
        await api.post('/user-logout', null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          Cookies.remove('token');  // Remove cookie here too
        }
  
        return;
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Logout failed');
      }
    }
  );

// Async Thunk — Load User from Token
export const loadUser = createAsyncThunk<LoginResponse, void, { rejectValue: ErrorResponse }>(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (!token) throw new Error('No token found');

            const response = await api.get<LoginResponse>('/me', {
                headers: { Authorization: `Bearer ${token}` },
            });

            return { ...response.data, token };
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Session expired or unauthorized' });
        }
    }
);

// Optional: Refresh Token (placeholder for future use)
export const refreshToken = createAsyncThunk<LoginResponse, void, { rejectValue: ErrorResponse }>(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post<LoginResponse>('/refresh-token');
            const { token } = response.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
            }

            return response.data;
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            return rejectWithValue(error.response?.data || { message: 'Token refresh failed' });
        }
    }
);

// Auth Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuthState(state) {
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.successMessage = 'Login successful';
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Login failed';
            })

            .addCase(loadUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loadUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = action.payload?.message || 'Session expired';
            })

            .addCase(refreshToken.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
            })

            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.successMessage = 'Logged out successfully';
              })
    },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;