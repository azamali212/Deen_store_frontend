'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import Loading from '@/components/ui/loadings/loading';
import React from 'react';


const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen  px-4 py-8">
     <RegisterForm />
    </div>
  );
};

export default RegisterPage;