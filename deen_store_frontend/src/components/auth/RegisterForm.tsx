'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/inputs/input';
import Button from '@/components/ui/buttons/button';
import Card from '@/components/ui/cards/card';
import { useRouter } from 'next/navigation';
import { Colors } from '@/constants/colors';
import Logo from '@/components/common/logo';
import Link from 'next/link';
import ROUTES from '@/constants/route.constant';

const RegisterForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Registering...', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // redirect or success logic
      router.push('ROUTES.DASHBOARD');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkStyle = {
    color: Colors.PRIMARY,
    textDecoration: 'underline',
    cursor: 'pointer'
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex justify-center mb-6">
        <Logo className="h-10 w-auto" />
      </div>

      <Card title="Create account">
        <p className="text-xs text-gray-600 mb-4">All fields are required</p>

        <div className="space-y-3">
          <Input
            type="text"
            name="name"
            label="Your name"
            placeholder="First and last name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            type="text"
            name="email"
            label="Mobile number or email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            type="password"
            name="confirmPassword"
            label="Re-enter password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isSubmitting}
            loadingText="Creating account..."
          >
            Continue
          </Button>
        </div>

        <p className="text-xs text-gray-600 mt-3">
          By creating an account, you agree to <strong>Shopinity's</strong>{' '}
          <a href="#" style={linkStyle}>Condition of Use</a>. Please see our{' '}
          <a href="#" style={linkStyle}>Privacy Notice</a>,{' '}
          <a href="#" style={linkStyle}>Cookies Notice</a> and our{' '}
          <a href="#" style={linkStyle}>Interest-Based Ads Notice</a>.
        </p>
      </Card>

      <div className="text-center text-xs text-gray-500 my-3">Buying for work?</div>
      <Card className="text-center py-2">
        <button
          type="button"
          onClick={() => router.push('/business-register')}
          style={linkStyle}
          className="text-sm font-medium"
        >
          Create a free business account
        </button>
      </Card>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-600">
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} style={linkStyle}>Sign In</Link>
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-gray-600">
        <a href="#" style={linkStyle}>Conditions of Use</a>
        <a href="#" style={linkStyle}>Privacy Notice</a>
        <a href="#" style={linkStyle}>Help</a>
        <a href="#" style={linkStyle}>Cookies Notice</a>
        <a href="#" style={linkStyle}>Interest-Based Ads Notice</a>
      </div>
    </form>
  );
};

export default RegisterForm;