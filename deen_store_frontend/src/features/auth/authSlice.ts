// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { AuthState, LoginPayload, LoginResponse, ErrorResponse } from '../../types/ui';
import Cookies from 'js-cookie';


// Helper function to generate a unique tab ID
const generateTabId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Get tab ID from session storage or generate a new one
const getTabId = () => {
  if (typeof window !== 'undefined') {
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
      tabId = generateTabId();
      sessionStorage.setItem('tabId', tabId);
    }
    return tabId;
  }
  return 'default-tab';
};

const tabId = getTabId();

const isAuthenticatedInThisTab = () => {
  if (typeof window !== 'undefined') {
    const tabId = sessionStorage.getItem('tabId');
    return !!localStorage.getItem(`auth_token_${tabId}`);
  }
  return false;
};

const getTokenKey = () => `auth_token_${tabId}`;
const getGuardKey = () => `auth_guard_${tabId}`;

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem(getTokenKey()) : null,
  loading: false,
  error: null,
  successMessage: null,
  isAuthenticated: false,
  tabId,
  guard: typeof window !== 'undefined' ? localStorage.getItem(getGuardKey()) : null,
};

// Listen for storage events to sync auth state across tabs


export const login = createAsyncThunk<LoginResponse, LoginPayload, { rejectValue: ErrorResponse }>(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/user-login', userData);
      const { token, guard, tab_session_id } = response.data;

      if (typeof window !== 'undefined') {
        // Store token and guard with tab-specific keys
        localStorage.setItem(getTokenKey(), token);
        localStorage.setItem(getGuardKey(), guard);

        // Also store in cookies for server-side access if needed
        Cookies.set('token', token, {
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      return { ...response.data, tabId };
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: ErrorResponse }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem(getTokenKey()) : null;

      if (token) {
        await api.post('/user-logout', null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (typeof window !== 'undefined') {
        // Clear tab-specific storage
        localStorage.removeItem(getTokenKey());
        localStorage.removeItem(getGuardKey());
        Cookies.remove('token');

        // Also clear all other tab tokens if needed
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('auth_token_') || key.startsWith('auth_guard_')) {
            localStorage.removeItem(key);
          }
        });
      }

      return;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

export const loadUser = createAsyncThunk<LoginResponse, void, { rejectValue: ErrorResponse }>(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem(getTokenKey()) : null;
      if (!token) throw new Error('No token found');

      const response = await api.get<LoginResponse>('/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { ...response.data, token, tabId };
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      return rejectWithValue(error.response?.data || { message: 'Session expired or unauthorized' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState(state) {
      state.error = null;
      state.successMessage = null;
    },
    initializeAuth(state) {
      if (typeof window !== 'undefined') {
        const currentTabId = sessionStorage.getItem('tabId') || getTabId(); // Use getTabId() instead
        const token = localStorage.getItem(`auth_token_${currentTabId}`);
        const guard = localStorage.getItem(`auth_guard_${currentTabId}`);

        state.token = token;
        state.guard = guard;
        state.isAuthenticated = !!token;
        state.tabId = currentTabId;
      }
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
        state.guard = action.payload.guard;
        state.isAuthenticated = true;
        state.successMessage = 'Login successful';
        state.tabId = action.payload.tab_session_id || tabId;
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
        state.guard = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Session expired';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.guard = null;
        state.isAuthenticated = false;
        state.successMessage = 'Logged out successfully';
      });
  },
});

export const { resetAuthState, initializeAuth } = authSlice.actions;
export default authSlice.reducer;