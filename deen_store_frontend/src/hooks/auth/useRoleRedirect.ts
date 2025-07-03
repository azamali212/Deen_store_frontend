// hooks/auth/useRoleRedirect.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export const useRoleRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return;

    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    
    if (roles.includes('Super Admin') || roles.includes('Admin')) {
      router.replace('/dashboard');
    } else if (roles.includes('Customer')) {
      router.replace('/user-dashboard');
    } else {
      // Public user or no specific role
      router.replace('/');
    }
  }, [router]);
};