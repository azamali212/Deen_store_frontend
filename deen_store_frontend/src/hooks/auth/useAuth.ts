import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';

import { LoginPayload } from '@/types/ui';
import { loadUser, login, logout, refreshToken, resetAuthState } from '@/features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    successMessage,
  } = useSelector((state: RootState) => state.auth);

  const handleLogin = (payload: LoginPayload) => {
    return dispatch(login(payload));
  };

  const handleLogout = () => {
    return dispatch(logout());
  };

  const handleLoadUser = () => {
    return dispatch(loadUser());
  };

  const handleRefreshToken = () => {
    return dispatch(refreshToken());
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
    login: handleLogin,
    logout: handleLogout,
    loadUser: handleLoadUser,
    refreshToken: handleRefreshToken,
    resetAuthState: clearAuthState,
  };
};