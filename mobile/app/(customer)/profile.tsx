import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/api/orders/my-orders');
      return response.data;
    }
  });

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* User Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.userDetail}>{user?.email || 'No email'}</Text>
            <Text style={styles.userDetail}>{user?.phone || 'No phone number'}</Text>
          </View>
        </View>

        {/* Settings / Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.linkBtn} onPress={() => {}}>
            <Ionicons name="location-outline" size={24} color={Colors.text} />
            <Text style={styles.linkText}>My Addresses</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkBtn} onPress={() => {}}>
            <Ionicons name="call-outline" size={24} color={Colors.text} />
            <Text style={styles.linkText}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => {}}>
            <Ionicons name="document-text-outline" size={24} color={Colors.text} />
            <Text style={styles.linkText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: Colors.surface,
    fontSize: 28,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  }
});
