'use client';

import React from 'react';
import Input from '@/components/ui/inputs/input';
import Button from '@/components/ui/buttons/button';
import Card from '@/components/ui/cards/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Colors } from '@/constants/colors';
import ROUTES from '@/constants/route.constant';

interface LoginFormProps {
  variant?: 'admin' | 'customer';
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  openForgotPassword: () => void;
  loading?: boolean;
  error?: string;
  successMessage?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  variant = 'customer',
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleLogin,
  openForgotPassword,
  loading = false,
  error,
  successMessage,
}) => {
  return (
    <form onSubmit={handleLogin} className="w-full max-w-sm">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Sign in</h2>

        <div className="space-y-4">
          <Input
            type="text"
            label="Email or mobile phone number"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant={variant}
          />

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                variant={variant}
                className="w-full px-4 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            style={{
              backgroundColor: variant === 'admin' ? Colors.ADMINLOGINCOLOR : Colors.PRIMARY,
              color: Colors.TEXT_LIGHT,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Continue'}
          </Button>

          <button type="button" onClick={openForgotPassword} className="text-sm text-primary underline mt-2">
            Forgot Password?
          </button>
        </div>

        {/* Other UI like Terms & Conditions */}
      </Card>
    </form>
  );
};

export default LoginForm;