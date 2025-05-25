'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import LoginForm from '@/components/auth/LoginForm';

import { useAuth } from '@/hooks/auth/useAuth';
import { useForgetPassword } from '@/hooks/auth/useForgotPassword';


const AdminLogin = () => {
    const router = useRouter();

    const {
        login,
        user,
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

    const [isMounted, setIsMounted] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [modalStep, setModalStep] = useState<
        'method' | 'email' | 'phone' | 'verification' | 'resetPassword' | null
    >(null);
    const [resetMethod, setResetMethod] = useState<'email' | 'phone' | null>(null);

    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotPhone, setForgotPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const lockData = localStorage.getItem('loginLock');
        const now = new Date().getTime();
      
        if (lockData && now < Number(lockData)) {
          const waitMinutes = Math.ceil((Number(lockData) - now) / 60000);
          alert(`You are temporarily locked out due to too many failed login attempts. Try again in ${waitMinutes} minute(s).`);
        }
      }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const token = Cookies.get('token');
            if (token) {
                router.replace('/dashboard');
            }
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (forgotPasswordSuccess) {
            setModalStep('verification');
        }
        if (resetPasswordSuccess) {
            alert('Password reset successful! Please log in.');
            clearState();
            setModalStep(null);
        }
    }, [forgotPasswordSuccess, resetPasswordSuccess]);

    const MAX_ATTEMPTS = 3;
    const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const now = new Date().getTime();
        const lockData = localStorage.getItem('loginLock');
        const attemptsData = localStorage.getItem('loginAttempts');

        if (lockData && now < Number(lockData)) {
            const waitMinutes = Math.ceil((Number(lockData) - now) / 60000);
            alert(`Too many login attempts. Please try again after ${waitMinutes} minute(s).`);
            return;
        }

        const result = await login({ email, password });

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
            // Login successful — reset attempts
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('loginLock');
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
            await requestForgotPassword({ email: forgotEmail });
        } else {
            console.warn('Phone reset method not yet implemented');
        }
    };

    const handleVerificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Skip actual code verification (mock)
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
            token: verificationCode, // Token should be actual from email ideally
        });
    };

    if (!isMounted) return null;

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <LoginForm
                variant="admin"
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleLogin={handleLogin}
                openForgotPassword={openForgotPassword}
                loading={loginLoading}
                error={loginError ?? undefined}
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
                loading={forgotLoading}
                error={forgotError}
            />
        </div>
    );
};

export default AdminLogin;