import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { ForgotPasswordPayload, ResetPasswordPayload, ErrorResponse } from '../../types/ui';

// Forgot password (request reset email)
export const forgotPassword = createAsyncThunk<
  { message: string },
  ForgotPasswordPayload,
  { rejectValue: ErrorResponse }
>(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/forgot-password', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      return rejectWithValue(error.response?.data || { message: 'Request failed' });
    }
  }
);

// Reset password (submit new password)
export const resetPassword = createAsyncThunk<
  { message: string },
  ResetPasswordPayload,
  { rejectValue: ErrorResponse }
>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/reset-password', data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      return rejectWithValue(error.response?.data || { message: 'Reset failed' });
    }
  }
);

interface ForgotPasswordState {
  loading: boolean;
  error: string | null;
  forgotPasswordSuccess: string | null;
  resetPasswordSuccess: string | null;
}

const initialState: ForgotPasswordState = {
  loading: false,
  error: null,
  forgotPasswordSuccess: null,
  resetPasswordSuccess: null,
};

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    clearForgotPasswordState(state) {
      state.error = null;
      state.forgotPasswordSuccess = null;
      state.resetPasswordSuccess = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // forgotPassword
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.forgotPasswordSuccess = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordSuccess = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Forgot password request failed';
      })

      // resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetPasswordSuccess = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordSuccess = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Reset password failed';
      });
  },
});

export const { clearForgotPasswordState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;