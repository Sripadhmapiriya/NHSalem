import axios from 'axios';
import * as Storage from '../utils/storage';

// Assuming local testing, use your machine's IP for Android, or localhost for iOS simulator.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true' // Bypasses localtunnel's anti-phishing screen
  },
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await Storage.getItemAsync('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Logic to clear token and redirect to login can go here
      await Storage.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);
