import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, typography } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { Input, Button } from '../../src/components/ui';
import { authApi } from '../../src/api/auth';
import * as Storage from '../../src/utils/storage';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, login } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authApi.updateProfile({ name, email, phone });
      if (response.success && response.user) {
        // Update user state in store by calling login with same token but new user data
        const token = await Storage.getItemAsync('auth_token');
        if (token) {
           // Assume role is customer since this is customer portal
           await login(token, { ...response.user, role: 'customer' });
        }
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : 'U'}</Text>
            </View>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Input
              label="Full Name"
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
            />
            
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Phone Number"
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Button 
            title="Save Changes" 
            onPress={handleSave} 
            loading={isLoading}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border
  },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.sm },
  headerTitle: { ...typography.h3, flex: 1 },
  content: { padding: Spacing.lg },
  avatarSection: { alignItems: 'center', marginVertical: Spacing.xl },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md
  },
  avatarText: { fontSize: 40, fontWeight: '800', color: Colors.white },
  changePhotoBtn: { padding: Spacing.sm },
  changePhotoText: { color: Colors.primary, fontWeight: '600', fontSize: 16 },
  formSection: { marginBottom: Spacing.xl },
  saveBtn: { marginTop: Spacing.lg }
});
