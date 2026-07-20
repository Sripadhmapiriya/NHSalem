import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { Button, Input, Card } from '../../src/components/ui';
import { authApi } from '../../src/api/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login } = useAuthStore();
  
  const [isCustomerMode, setIsCustomerMode] = useState(true);
  const [identifier, setIdentifier] = useState(isCustomerMode ? 'user@nhsalem.com' : 'admin@nhsalem.com');
  const [password, setPassword] = useState(isCustomerMode ? 'password123' : 'admin123');
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setIsCustomerMode(!isCustomerMode);
    setIdentifier(!isCustomerMode ? 'user@nhsalem.com' : 'admin@nhsalem.com');
    setPassword(!isCustomerMode ? 'password123' : 'admin123');
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isCustomerMode) {
        const response = await authApi.loginCustomer(identifier, password);
        if (response.success) {
          // The backend returns user without role, but we know it's a customer
          await login(response.token, { ...response.user, role: 'customer' });
        }
      } else {
        const response = await authApi.loginAdmin(identifier, password);
        if (response.success) {
          // Admin response includes role
          await login(response.token, response.admin);
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      Alert.alert(
        'Login Failed', 
        error.response?.data?.message || 'Check your credentials and try again'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>NH Salem</Text>
          <Text style={styles.subtitle}>
            {isCustomerMode ? 'Sign in to buy fresh seafood' : 'Admin Portal Access'}
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleTab, isCustomerMode && styles.activeTab]}
              onPress={() => !isCustomerMode && toggleMode()}
            >
              <Ionicons name="person-outline" size={20} color={isCustomerMode ? Colors.white : Colors.textLight} />
              <Text style={[styles.tabText, isCustomerMode && styles.activeTabText]}>Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleTab, !isCustomerMode && styles.activeAdminTab]}
              onPress={() => isCustomerMode && toggleMode()}
            >
              <Ionicons name="shield-outline" size={20} color={!isCustomerMode ? Colors.white : Colors.textLight} />
              <Text style={[styles.tabText, !isCustomerMode && styles.activeTabText]}>Admin</Text>
            </TouchableOpacity>
          </View>

          <Input
            label={isCustomerMode ? "Email or Phone Number" : "Admin Email"}
            placeholder={isCustomerMode ? "e.g., user@nhsalem.com or 9876543210" : "admin@nhsalem.com"}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType={isCustomerMode ? "default" : "email-address"}
          />
          
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={`Login as ${isCustomerMode ? 'Customer' : 'Admin'}`}
            onPress={handleLogin}
            loading={isLoading}
            variant={isCustomerMode ? 'primary' : 'admin'}
            style={styles.loginButton}
          />
        </Card>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  card: {
    padding: Spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceDark,
    borderRadius: 8,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  activeAdminTab: {
    backgroundColor: Colors.adminPrimary,
  },
  tabText: {
    color: Colors.textLight,
    fontWeight: '600',
    fontSize: 16,
  },
  activeTabText: {
    color: Colors.white,
  },
  loginButton: {
    marginTop: Spacing.md,
  }
});
