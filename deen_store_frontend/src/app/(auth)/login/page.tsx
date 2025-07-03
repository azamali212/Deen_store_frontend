'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/auth/useAuth';

const Login = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const { 
    login, 
    loading, 
    error, 
    isAuthenticated 
  } = useAuth();

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modal states
  const [modalStep, setModalStep] = useState<'method' | 'email' | 'phone' | 'verification' | 'resetPassword' | null>(null);
  const [resetMethod, setResetMethod] = useState<'email' | 'phone' | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setIsMounted(true);
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/userInterface');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // No need to redirect here - the useEffect will handle it when isAuthenticated changes
    } catch (error) {
      // Error is already handled by the auth slice
      console.error('Login failed:', error);
    }
  };

  const openForgotPassword = () => {
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

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetMethod === 'email') {
      console.log('Send email to:', forgotEmail);
    } else {
      console.log('Send SMS to:', forgotPhone);
    }
    setModalStep('verification');
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verify code:', verificationCode);
    setModalStep('resetPassword');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    console.log('Reset password to:', newPassword);
    setModalStep(null);
    alert('Password reset successfully!');
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <LoginForm
        variant="customer"
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleLogin={handleLogin}
        openForgotPassword={openForgotPassword}
        loading={loading}
        error={error}
      />

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
      />
    </div>
  );
};

export default Login;