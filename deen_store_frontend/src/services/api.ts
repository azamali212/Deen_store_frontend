import ROUTES from '@/constants/route.constant';
import axios from 'axios';


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // 👈 Important to include cookies in requests
});

// Add Authorization header if token exists (optional if backend needs it)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token'); // ⚠️ If still using localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto logout on 401 Unauthorized
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = ROUTES.ADMIN_LOGIN_ACCESS;
    }
    return Promise.reject(error);
  }
);

export default api;