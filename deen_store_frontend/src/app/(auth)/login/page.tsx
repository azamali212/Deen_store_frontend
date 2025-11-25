// components/auth/Login.tsx (updated version)
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import LoginForm from '@/components/auth/LoginForm';

import { useAuth } from '@/hooks/auth/useAuth';
import { useForgetPassword } from '@/hooks/auth/useForgotPassword';
import { useLocation } from '@/hooks/location/useLocation';

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const {
    login,
    error: loginError,
    loading: loginLoading,
    isAuthenticated,
    resetAuthState,
  } = useAuth();

  const {
    requestForgotPassword,
    requestResetPassword,
    clearState,
    loading: forgotLoading,
    error: forgotError,
    forgotPasswordSuccess,
    resetPasswordSuccess,
  } = useForgetPassword();

  const { location: currentLocation, loading: locationLoading, getLocation } = useLocation();

  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modalStep, setModalStep] = useState<'method' | 'email' | 'phone' | 'verification' | 'resetPassword' | null>(null);
  const [resetMethod, setResetMethod] = useState<'email' | 'phone' | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check URL parameters on mount
  useEffect(() => {
    const portal = searchParams.get('portal');
    const redirect = searchParams.get('redirect');
    
    setIsAdminPortal(portal === 'admin');
    setRedirectPath(redirect || '');
    setIsMounted(true);

    // Reset auth state on component mount
    resetAuthState();
  }, [searchParams, resetAuthState]);

  useEffect(() => {
    const lockData = localStorage.getItem('loginLock');
    const now = new Date().getTime();

    if (lockData && now < Number(lockData)) {
      const waitMinutes = Math.ceil((Number(lockData) - now) / 60000);
      alert(`You are temporarily locked out due to too many failed login attempts. Try again in ${waitMinutes} minute(s).`);
    }
  }, []);

  // Handle authentication and redirect - FIXED VERSION
  useEffect(() => {
    // Only proceed if we're authenticated AND not currently logging in
    if (isAuthenticated && !isLoggingIn) {
      const currentTabId = sessionStorage.getItem('tabId');
      const currentToken = localStorage.getItem(`auth_token_${currentTabId}`);
      
      console.log('Auth check - Authenticated:', isAuthenticated, 'Token:', !!currentToken);
      
      if (currentToken) {
        const targetPath = redirectPath || (isAdminPortal ? '/dashboard' : '/userInterface');
        console.log('Redirecting to:', targetPath);
        
        // Use replace to prevent back navigation
        router.replace(targetPath);
        setRedirectPath('');
      }
    }
  }, [isAuthenticated, isLoggingIn, router, isAdminPortal, redirectPath]);

  // Prevent back navigation after login
  useEffect(() => {
    if (isAuthenticated) {
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
        const targetPath = isAdminPortal ? '/dashboard' : '/userInterface';
        if (window.location.pathname !== targetPath) {
          router.replace(targetPath);
        }
      };

      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isAuthenticated, isAdminPortal, router]);

  useEffect(() => {
    if (forgotPasswordSuccess) {
      setModalStep('verification');
    }
    if (resetPasswordSuccess) {
      alert('Password reset successful! Please log in.');
      clearState();
      setModalStep(null);
    }
  }, [forgotPasswordSuccess, resetPasswordSuccess, clearState]);

  const MAX_ATTEMPTS = 3;
  const LOCK_DURATION_MS = 5 * 60 * 1000;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous login attempts
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);

    const now = new Date().getTime();
    const lockData = localStorage.getItem('loginLock');
    const attemptsData = localStorage.getItem('loginAttempts');

    if (lockData && now < Number(lockData)) {
      const waitMinutes = Math.ceil((Number(lockData) - now) / 60000);
      alert(`Too many login attempts. Please try again after ${waitMinutes} minute(s).`);
      setIsLoggingIn(false);
      return;
    }

    let locationData;
    try {
      locationData = await getLocation();
    } catch (error) {
      console.warn('Failed to get location data:', error);
    }

    try {
      const result = await login({ 
        email, 
        password, 
        location_data: locationData,
        user_type: isAdminPortal ? 'admin' : 'customer'
      });

      if (result.meta.requestStatus === 'rejected') {
        const currentAttempts = attemptsData ? parseInt(attemptsData, 10) : 0;
        const newAttempts = currentAttempts + 1;
        localStorage.setItem('loginAttempts', newAttempts.toString());

        if (newAttempts >= MAX_ATTEMPTS) {
          localStorage.setItem('loginLock', (now + LOCK_DURATION_MS).toString());
          localStorage.removeItem('loginAttempts');
          alert('Too many failed login attempts. Please try again after 5 minutes.');
        }
      } else {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginLock');
        
        // Clear form after successful login
        setEmail('');
        setPassword('');
        
        // Login successful - the useEffect will handle redirect
        console.log('Login successful, waiting for redirect...');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      // Reset logging state after a short delay to ensure redirect happens
      setTimeout(() => {
        setIsLoggingIn(false);
      }, 1000);
    }
  };

  const openForgotPassword = () => {
    clearState();
    setModalStep('method');
    setResetMethod(null);
    setForgotEmail('');
    setForgotPhone('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChooseMethod = (method: 'email' | 'phone') => {
    setResetMethod(method);
    setModalStep(method);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (resetMethod === 'email') {
      await requestForgotPassword({ 
        email: forgotEmail,
        user_type: isAdminPortal ? 'admin' : 'customer'
      });
    } else {
      console.warn('Phone reset method not yet implemented');
    }
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalStep('resetPassword');
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    await requestResetPassword({
      email: forgotEmail,
      password: newPassword,
      password_confirmation: confirmPassword,
      token: verificationCode,
      user_type: isAdminPortal ? 'admin' : 'customer'
    });
  };

  const switchToAdminPortal = () => {
    setIsAdminPortal(true);
    window.history.replaceState(null, '', '/login?portal=admin');
  };

  const switchToCustomerPortal = () => {
    setIsAdminPortal(false);
    window.history.replaceState(null, '', '/login');
  };

  if (!isMounted) return null;

  // Combined loading state
  const isLoading = loginLoading || locationLoading || isLoggingIn;

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <LoginForm
          variant={isAdminPortal ? "admin" : "customer"}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleLogin={handleLogin}
          openForgotPassword={openForgotPassword}
          loading={isLoading}
          error={loginError ?? undefined}
          currentLocation={currentLocation}
          locationLoading={locationLoading}
        />
        
        {/* Business Account Login Link */}
        <div className="text-center mt-4">
          {!isAdminPortal ? (
            <button
              onClick={switchToAdminPortal}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition duration-200"
              disabled={isLoading}
            >
              Business account login?
            </button>
          ) : (
            <button
              onClick={switchToCustomerPortal}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition duration-200"
              disabled={isLoading}
            >
              Back to customer login
            </button>
          )}
        </div>
      </div>

      <ForgotPasswordModal
        modalStep={modalStep}
        onClose={() => setModalStep(null)}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        forgotPhone={forgotPhone}
        setForgotPhone={setForgotPhone}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        onSubmitEmail={handleForgotPasswordSubmit}
        onSubmitVerification={handleVerificationSubmit}
        onSubmitResetPassword={handleResetPasswordSubmit}
        onSelectMethod={handleChooseMethod}
        loading={forgotLoading}
        error={forgotError}
      />
    </div>
  );
};

export default Login;