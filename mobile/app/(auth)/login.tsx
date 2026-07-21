import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { Button, Input, Card } from '../../src/components/ui';
import { authApi } from '../../src/api/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

type AuthMode = 'login' | 'register' | 'admin';

export default function LoginScreen() {
  const { login } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [mode, setMode] = useState<AuthMode>(
    params.mode === 'register' ? 'register' : 'login'
  );

  // Login state
  const [identifier, setIdentifier] = useState('user@nhsalem.com');
  const [password, setPassword] = useState('password123');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode === 'admin') {
      setIdentifier('admin@nhsalem.com');
      setPassword('admin123');
    } else if (mode === 'login') {
      setIdentifier('user@nhsalem.com');
      setPassword('password123');
    }
  }, [mode]);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (mode === 'register') {
        if (!regName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
          Alert.alert('Error', 'Please fill in all fields');
          setIsLoading(false);
          return;
        }
        if (regPassword !== regConfirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          setIsLoading(false);
          return;
        }

        const response = await authApi.registerCustomer({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        });

        if (response.success) {
          await login(response.token, { ...response.user, role: 'customer' });
          router.replace('/(customer)');
        }
      } else if (mode === 'login') {
        if (!identifier || !password) {
          Alert.alert('Error', 'Please enter all fields');
          setIsLoading(false);
          return;
        }

        const response = await authApi.loginCustomer(identifier, password);
        if (response.success) {
          await login(response.token, { ...response.user, role: 'customer' });
          router.replace('/(customer)');
        }
      } else if (mode === 'admin') {
        if (!identifier || !password) {
          Alert.alert('Error', 'Please enter all fields');
          setIsLoading(false);
          return;
        }

        const response = await authApi.loginAdmin(identifier, password);
        if (response.success) {
          await login(response.token, response.admin);
          router.replace('/(admin)');
        }
      }
    } catch (error: any) {
      console.error('Auth failed:', error);
      Alert.alert(
        'Authentication Failed', 
        error.response?.data?.message || 'Check your details and try again'
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>NH Salem</Text>
            <Text style={styles.subtitle}>
              {mode === 'admin' ? 'Admin Portal Access' : 'Fresh seafood at your door'}
            </Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleTab, mode === 'login' && styles.activeTab]}
                onPress={() => setMode('login')}
              >
                <Ionicons name="person-outline" size={16} color={mode === 'login' ? Colors.white : Colors.textLight} />
                <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.toggleTab, mode === 'register' && styles.activeTab]}
                onPress={() => setMode('register')}
              >
                <Ionicons name="person-add-outline" size={16} color={mode === 'register' ? Colors.white : Colors.textLight} />
                <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Sign Up</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.toggleTab, mode === 'admin' && styles.activeAdminTab]}
                onPress={() => setMode('admin')}
              >
                <Ionicons name="shield-outline" size={16} color={mode === 'admin' ? Colors.white : Colors.textLight} />
                <Text style={[styles.tabText, mode === 'admin' && styles.activeTabText]}>Admin</Text>
              </TouchableOpacity>
            </View>

            {mode === 'register' ? (
              <View>
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={regName}
                  onChangeText={setRegName}
                />
                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Input
                  label="Mobile Number"
                  placeholder="10-digit mobile number"
                  value={regPhone}
                  onChangeText={setRegPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                />
                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChangeText={setRegConfirmPassword}
                  secureTextEntry
                />
              </View>
            ) : (
              <View>
                <Input
                  label={mode === 'login' ? "Email or Phone Number" : "Admin Email"}
                  placeholder={mode === 'login' ? "e.g., user@nhsalem.com or 9876543210" : "admin@nhsalem.com"}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType={mode === 'login' ? "default" : "email-address"}
                />
                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            )}

            <Button
              title={mode === 'register' ? 'Create Account' : `Login as ${mode === 'login' ? 'Customer' : 'Admin'}`}
              onPress={handleAuth}
              loading={isLoading}
              variant={mode === 'admin' ? 'admin' : 'primary'}
              style={styles.loginButton}
            />
          </Card>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
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
    gap: 4,
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
    fontSize: 13,
  },
  activeTabText: {
    color: Colors.white,
  },
  loginButton: {
    marginTop: Spacing.md,
  }
});
