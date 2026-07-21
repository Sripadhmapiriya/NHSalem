import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { useCartStore } from '../src/store/cartStore';
import { AuthGateModal } from '../src/components/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { loadFromStorage, isLoggedIn, pendingAction, setPendingAction } = useAuthStore();
  const { addItem } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    const store = useAuthStore.getState();
    if ('loadFromStorage' in store) {
      (store as any).loadFromStorage();
    } else if ('restoreToken' in store) {
      (store as any).restoreToken();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && pendingAction) {
      const action = pendingAction;
      // Clear immediately to prevent double execution
      setPendingAction(null);

      // Simple delay to let navigation to (customer) finish from login screen
      setTimeout(() => {
        if (action.type === 'ADD_TO_CART' && action.payload) {
          addItem(action.payload);
        } else if (action.type === 'CHECKOUT') {
          router.push('/(customer)/checkout');
        } else if (action.type === 'TOGGLE_WISHLIST') {
          // Placeholder for wishlist toggle logic
        }
      }, 500);
    }
  }, [isLoggedIn, pendingAction]);

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
          <AuthGateModal />
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
