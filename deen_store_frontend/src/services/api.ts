import ROUTES from '@/constants/route.constant';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

// Add Authorization header if token exists
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const tabId = sessionStorage.getItem('tabId');
    if (tabId) {
      const token = localStorage.getItem(`auth_token_${tabId}`);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Auto logout on 401 Unauthorized
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Clear all auth-related storage
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('auth_token_') || key.startsWith('auth_guard_')) {
            localStorage.removeItem(key);
          }
        });
        window.location.href = ROUTES.ADMIN_LOGIN_ACCESS;
      }
    }
    return Promise.reject(error);
  }
);

export default api;