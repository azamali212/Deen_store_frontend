import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { LoginPayload } from '@/types/ui';
import { loadUser, login, logout, resetAuthState, initializeAuth } from '@/features/auth/authSlice';
import { useEffect } from 'react';

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

  const handleLogin = (payload: LoginPayload) => {
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
  };
};