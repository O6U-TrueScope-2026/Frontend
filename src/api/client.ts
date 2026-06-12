import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import i18n from '../i18n';

let isToastActive = false;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();

      // 1. Clear Auth State
      logout();

      // 2. UX Notification with Throttling
      if (!isToastActive) {
        isToastActive = true;
        toast.error(i18n.t('errors.unauthorized'), {
          id: 'auth-error', // Fixed ID prevents multiple toasts
          duration: 4000,
        });
        
        // Reset throttle flag
        setTimeout(() => {
          isToastActive = false;
        }, 3000);
      }

      // 3. Clean Navigation Redirect
      // Use window.location for a pure TS file to ensure a clean state reset
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
