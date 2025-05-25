
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store'; // Adjust import path to your store setup
import {
  forgotPassword,
  resetPassword,
  clearForgotPasswordState,
} from '@/features/auth/forgetPasswordSlice'; // Adjust path if needed
import type { ForgotPasswordPayload, ResetPasswordPayload } from '../../types/ui';

// Typed hooks for your Redux store (optional but recommended)
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useForgetPassword = () => {
  const dispatch = useAppDispatch();

  // Selectors for state slices
  const loading = useAppSelector((state) => state.forgotPassword.loading);
  const error = useAppSelector((state) => state.forgotPassword.error);
  const forgotPasswordSuccess = useAppSelector(
    (state) => state.forgotPassword.forgotPasswordSuccess
  );
  const resetPasswordSuccess = useAppSelector(
    (state) => state.forgotPassword.resetPasswordSuccess
  );

  // Action dispatchers wrapped in functions
  const requestForgotPassword = (payload: ForgotPasswordPayload) =>
    dispatch(forgotPassword(payload));

  const requestResetPassword = (payload: ResetPasswordPayload) =>
    dispatch(resetPassword(payload));

  const clearState = () => dispatch(clearForgotPasswordState());

  return {
    loading,
    error,
    forgotPasswordSuccess,
    resetPasswordSuccess,
    requestForgotPassword,
    requestResetPassword,
    clearState,
  };
};