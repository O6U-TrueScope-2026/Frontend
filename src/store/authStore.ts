import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

interface User {
  _id: string;
  email: string;
  name?: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isFetchingProfile: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  checkAuth: () => void;
  fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isFetchingProfile: false,
      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      checkAuth: () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          set({ isAuthenticated: true, accessToken: token });
        }
      },
      fetchUserProfile: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        set({ isFetchingProfile: true });
        try {
          const response = await apiClient.get('/user/profile');
          set({ user: response.data.user, isFetchingProfile: false });
        } catch (error: any) {
          set({ isFetchingProfile: false });
          if (error.response?.status === 404) {
            get().logout();
          }
          console.error('Failed to fetch user profile:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
