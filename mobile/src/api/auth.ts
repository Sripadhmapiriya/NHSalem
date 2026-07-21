import { apiClient } from './client';
import { UserRole } from '../store/authStore';

export const authApi = {
  loginCustomer: async (emailOrPhone: string, password: string) => {
    // Determine if input is email or phone
    const isEmail = emailOrPhone.includes('@');
    const payload = isEmail 
      ? { email: emailOrPhone, password }
      : { phone: emailOrPhone, password };

    const { data } = await apiClient.post('/api/auth/login', payload);
    return data;
  },

  registerCustomer: async (payload: any) => {
    const { data } = await apiClient.post('/api/auth/register', payload);
    return data;
  },

  loginAdmin: async (email: string, password: string) => {
    const { data } = await apiClient.post('/api/admin/auth/login', { email, password });
    return data;
  },

  updateProfile: async (payload: { name?: string; email?: string; phone?: string }) => {
    const { data } = await apiClient.put('/api/auth/me', payload);
    return data;
  }
};
