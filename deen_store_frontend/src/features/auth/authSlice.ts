import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { AuthState, LoginPayload, LoginResponse, ErrorResponse } from '../../types/ui';
import Cookies from 'js-cookie';
import { LocationData } from '@/hooks/location/useLocation';

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

export interface EnhancedLoginPayload extends LoginPayload {
  location_data?: LocationData;
  user_type?: 'admin' | 'customer';
}

export const login = createAsyncThunk<LoginResponse, EnhancedLoginPayload, { rejectValue: ErrorResponse }>(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Making login API call...', { user_type: userData.user_type });
      const response = await api.post('/user-login', userData);
      const { token, guard, tab_session_id, location, user } = response.data;

      console.log('Login response received:', { 
        token: !!token, 
        guard, 
        user_type: userData.user_type 
      });

      if (typeof window !== 'undefined') {
        // Generate or get tab ID
        let tabId = sessionStorage.getItem('tabId');
        if (!tabId) {
          tabId = generateTabId();
          sessionStorage.setItem('tabId', tabId);
        }
        
        console.log('Using tab ID:', tabId);

        // Store token and guard with tab-specific keys
        const tokenKey = `auth_token_${tabId}`;
        const guardKey = `auth_guard_${tabId}`;
        
        localStorage.setItem(tokenKey, token);
        
        // Use the user_type from login request or fallback to API response
        const userGuard = userData.user_type || guard || 'customer';
        localStorage.setItem(guardKey, userGuard);

        console.log('Tokens stored - Token key:', tokenKey, 'Guard:', userGuard);

        // Store location data
        if (location) {
          sessionStorage.setItem('login_location', JSON.stringify(location));
        }

        // CRITICAL: Set cookies for middleware access
        // Set auth_token cookie
        Cookies.set('auth_token', token, {
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        // Set user_guard cookie
        Cookies.set('user_guard', userGuard, {
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        // Set currentTabId cookie
        Cookies.set('currentTabId', tabId, {
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        console.log('Cookies set successfully');
      }

      return { 
        ...response.data, 
        tabId,
        guard: userData.user_type || guard // Use the user_type from login request
      };
    } catch (err) {
      console.error('Login API error:', err);
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
        // Clear auth-related storage only
        const authKeys = [
          'auth_token_',
          'auth_guard_', 
          'multiGuardAuth',
          'token',
          'user',
          'loginAttempts',
          'loginLock',
          'current_user_type'
        ];
        
        Object.keys(localStorage).forEach(key => {
          if (authKeys.some(authKey => key.startsWith(authKey))) {
            localStorage.removeItem(key);
          }
        });
        
        sessionStorage.clear();

        // Clear auth cookies
        const authCookies = ['auth_token', 'user_guard', 'currentTabId', 'token', 'PHPSESSID'];
        authCookies.forEach(cookieName => {
          Cookies.remove(cookieName);
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }

      return;
    } catch (err: any) {
      // Even if API call fails, clear local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
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
        const currentTabId = sessionStorage.getItem('tabId') || getTabId();
        const token = localStorage.getItem(`auth_token_${currentTabId}`);

        // Only set as authenticated if THIS tab has a token
        state.token = token;
        state.isAuthenticated = !!token;
        state.tabId = currentTabId;

        // If no token for this tab, clear any potential state
        if (!token) {
          state.user = null;
          state.guard = null;
        }
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