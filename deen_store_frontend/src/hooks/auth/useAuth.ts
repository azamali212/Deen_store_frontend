// hooks/auth/useAuth.ts
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { login, logout, verifyOtp, checkSession, clearError, forceLogout } from "@/features/auth/authSlice";
import { useEffect, useState } from "react";
import { AuthStorage } from "@/core/auth/auth.storage";
import { usePathname } from "next/navigation";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check session on mount and on route change
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Initializing auth check...");
      
      // Determine which portal based on current path
      let portalToCheck: ("admin" | "customer")[] = [];
      
      if (pathname?.includes('/dashboard') || pathname?.includes('/admin') || 
          pathname === '/user' || pathname === '/role' || pathname === '/permissions') {
        portalToCheck.push('admin');
      }
      
      if (pathname?.includes('/userInterface') || pathname?.includes('/customer')) {
        portalToCheck.push('customer');
      }
      
      // If no specific portal detected, check both
      if (portalToCheck.length === 0) {
        portalToCheck = ['admin', 'customer'];
      }
      
      console.log(`Checking portals:`, portalToCheck);
      
      // Check sessions for detected portals
      for (const portal of portalToCheck) {
        if (AuthStorage.hasToken(portal)) {
          console.log(`🔑 Found token for ${portal}, checking session...`);
          try {
            await dispatch(checkSession(portal)).unwrap();
          } catch (error) {
            console.log(`Session check failed for ${portal}:`, error);
          }
        }
      }
      
      setIsInitialized(true);
      console.log("✅ Auth initialization complete");
    };
    
    initializeAuth();
  }, [dispatch, pathname]); // Add pathname to dependencies

  return {
    auth,
    loading: auth.loading,
    logoutLoading: auth.logoutLoading,
    error: auth.error,
    isInitialized, // Add this to track initialization

    login: (payload: {
      email: string;
      password: string;
      portal: "admin" | "customer";
    }) => dispatch(login(payload)),

    verifyOtp: (payload: {
      portal: "admin" | "customer";
      email: string;
      session_id: string;
      otp: string;
    }) => dispatch(verifyOtp(payload)),

    logout: (portal: "admin" | "customer") => dispatch(logout(portal)),
    
    forceLogout: (portal: "admin" | "customer") => dispatch(forceLogout(portal)),
    
    clearError: () => dispatch(clearError()),
    
    checkSession: (portal: "admin" | "customer") => dispatch(checkSession(portal)),
  };
};