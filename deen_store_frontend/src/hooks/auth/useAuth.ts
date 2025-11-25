// hooks/auth/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { LoginPayload } from '@/types/ui';
import { loadUser, login, logout, resetAuthState, initializeAuth } from '@/features/auth/authSlice';
import { useEffect } from 'react';
import { LocationData } from '../location/useLocation';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    successMessage,
    guard,
    tabId,
  } = useSelector((state: RootState) => state.auth);

  // Initialize auth state on mount
  useEffect(() => {
    dispatch(initializeAuth());
    // Optionally load user if token exists
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  const handleLogin = (payload: LoginPayload & { location_data?: LocationData }) => {
    return dispatch(login(payload));
  };

  const handleLogout = () => {
    return dispatch(logout());
  };

  const handleLoadUser = () => {
    return dispatch(loadUser());
  };

  const clearAuthState = () => {
    dispatch(resetAuthState());
  };

  // Get stored location data
  const getStoredLocation = (): LocationData | null => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('login_location');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    successMessage,
    guard,
    tabId,
    login: handleLogin,
    logout: handleLogout,
    loadUser: handleLoadUser,
    resetAuthState: clearAuthState,
    getStoredLocation,
  };
};