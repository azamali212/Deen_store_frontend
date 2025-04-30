"use client";

import React from 'react';
import Input from '@/components/ui/inputs/input';
import Button from '@/components/ui/buttons/button';
import Model from '@/components/ui/modals/model';
import { Colors } from '@/constants/colors';
import { ForgotPasswordModalProps } from '@/types/ui';
import { usePathname } from 'next/navigation'; // ✨ import

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = (props) => {
  const {
    modalStep,
    onClose,
    forgotEmail,
    setForgotEmail,
    forgotPhone,
    setForgotPhone,
    verificationCode,
    setVerificationCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    onSubmitEmail,
    onSubmitVerification,
    onSubmitResetPassword,
    onSelectMethod,
  } = props;

  const pathname = usePathname(); // ✨ get the current path
  const isShopinintyAdmin = pathname.includes('shopinity_admin_login'); // ✨ adjust based on your correct admin path

  // ✨ Set button color based on admin or customer
  const buttonColor = isShopinintyAdmin ? Colors.ADMINLOGINCOLOR : Colors.PRIMARY;

  return (
    <Model
      isOpen={modalStep !== null}
      onClose={onClose}
      title={
        modalStep === 'method'
          ? 'Choose Reset Method'
          : modalStep === 'email'
          ? 'Reset via Email'
          : modalStep === 'phone'
          ? 'Reset via SMS'
          : modalStep === 'verification'
          ? 'Enter Verification Code'
          : 'Set New Password'
      }
      position="top"
    >
      {modalStep === 'method' && (
        <div className="space-y-4">
          <p className="text-body">How would you like to reset your password?</p>
          <Button
            className="w-full"
            style={{ backgroundColor: buttonColor }}
            onClick={() => onSelectMethod?.('email')}
          >
            Reset via Email
          </Button>
          <Button
            className="w-full"
            style={{ backgroundColor: buttonColor }}
            onClick={() => onSelectMethod?.('phone')}
          >
            Reset via SMS
          </Button>
        </div>
      )}

      {modalStep === 'email' && (
        <form onSubmit={onSubmitEmail} className="space-y-4">
          <p className="text-body">Enter your email address to receive a verification code.</p>
          <Input
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" style={{ backgroundColor: buttonColor }}>
            Send Code
          </Button>
        </form>
      )}

      {modalStep === 'phone' && (
        <form onSubmit={onSubmitEmail} className="space-y-4">
          <p className="text-body">Enter your phone number to receive a verification code.</p>
          <Input
            type="tel"
            label="Phone Number"
            placeholder="+1 234 567 890"
            value={forgotPhone}
            onChange={(e) => setForgotPhone(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" style={{ backgroundColor: buttonColor }}>
            Send Code
          </Button>
        </form>
      )}

      {modalStep === 'verification' && (
        <form onSubmit={onSubmitVerification} className="space-y-4">
          <Input
            type="text"
            label="Verification Code"
            placeholder="Enter code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" style={{ backgroundColor: buttonColor }}>
            Verify Code
          </Button>
        </form>
      )}

      {modalStep === 'resetPassword' && (
        <form onSubmit={onSubmitResetPassword} className="space-y-4">
          <Input
            type="password"
            label="New Password"
            placeholder="********"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            label="Confirm Password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" style={{ backgroundColor: buttonColor }}>
            Reset Password
          </Button>
        </form>
      )}
    </Model>
  );
};

export default ForgotPasswordModal;