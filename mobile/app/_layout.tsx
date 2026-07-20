import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator } from 'react-native';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { user, isLoading, restoreToken } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(customer)');
      }
    } else if (user && !inAuthGroup) {
        const inAdminGroup = segments[0] === '(admin)';
        if ((user.role === 'admin' || user.role === 'super_admin') && !inAdminGroup) {
             router.replace('/(admin)');
        } else if (user.role !== 'admin' && user.role !== 'super_admin' && inAdminGroup) {
             router.replace('/(customer)');
        }
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0B4A7A" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}
