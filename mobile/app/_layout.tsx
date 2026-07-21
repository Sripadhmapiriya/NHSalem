import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    const store = useAuthStore.getState();
    if ('loadFromStorage' in store) {
      (store as any).loadFromStorage();
    } else if ('restoreToken' in store) {
      (store as any).restoreToken();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f8fafc' } }}>
              <Stack.Screen name="(customer)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="search" options={{ headerShown: false }} />
            </Stack>
          </KeyboardAvoidingView>
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
