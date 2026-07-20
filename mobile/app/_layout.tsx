import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    // Load token from AsyncStorage on app start
    // If the method is named restoreToken in the old store, use it, otherwise loadFromStorage.
    // Our new store uses loadFromStorage, but we'll adapt to either.
    const store = useAuthStore.getState();
    if ('loadFromStorage' in store) {
      (store as any).loadFromStorage();
    } else if ('restoreToken' in store) {
      (store as any).restoreToken();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        {/* Add more stacks here as needed, like checkout.tsx, search.tsx etc */}
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
