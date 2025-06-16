import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from '@/features/auth/authSlice';
import forgotPasswordReducer from '@/features/auth/forgetPasswordSlice';
import roleReducer from '@/features/role/roleSlice';
import permissionReducer from '@/features/permissions/permissionsSlice';
import userSlice from '@/features/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    forgotPassword: forgotPasswordReducer,
    role: roleReducer,
    permissions:permissionReducer,
    user:userSlice
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;