import { create } from 'zustand';
import * as Storage from '../utils/storage';
import { apiClient } from '../api/client';

export type UserRole = 'customer' | 'admin' | 'super_admin';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isLoggedIn: false,
  login: async (token, user) => {
    await Storage.setItemAsync('auth_token', token);
    await Storage.setItemAsync('user_data', JSON.stringify(user));
    set({ token, user, isLoggedIn: true });
  },
  logout: async () => {
    await Storage.deleteItemAsync('auth_token');
    await Storage.deleteItemAsync('user_data');
    set({ token: null, user: null, isLoggedIn: false });
  },
  restoreToken: async () => {
    set({ isLoading: true });
    try {
      const token = await Storage.getItemAsync('auth_token');
      const userData = await Storage.getItemAsync('user_data');
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isLoggedIn: true });
      }
    } catch (e) {
      console.error('Error restoring auth', e);
    } finally {
      set({ isLoading: false });
    }
  },
  loadFromStorage: async () => {
    await get().restoreToken();
  },
}));
