import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, typography, shadows } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: stats, refetch } = useQuery({
    queryKey: ['user', 'stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/auth/me/stats');
        return response.data;
      } catch (e) {
        return { order_count: 0, total_spent: 0 };
      }
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refetch();
      }
    }, [user])
  );

  const menuItems = [
    {
      id: 'orders',
      icon: 'cube-outline',
      label: 'My Orders',
      subtitle: 'Track and view your orders',
      onPress: () => router.push('/(customer)/orders')
    },
    {
      id: 'subscription',
      icon: 'refresh-circle-outline', 
      label: 'My Subscription',
      subtitle: 'Manage your seafood plan',
      onPress: () => router.push('/(customer)/subscription')
    },
    {
      id: 'addresses',
      icon: 'location-outline',
      label: 'My Addresses',
      subtitle: 'Manage delivery addresses',
      onPress: () => router.push('/(customer)/addresses')
    },
    {
      id: 'wishlist',
      icon: 'heart-outline',
      label: 'My Wishlist',
      subtitle: 'Saved products',
      onPress: () => router.push('/(customer)/wishlist')
    },
    {
      id: 'contact',
      icon: 'call-outline',
      label: 'Contact Us',
      subtitle: 'Get help from our team',
      onPress: () => router.push('/(customer)/contact')
    },
    {
      id: 'faq',
      icon: 'help-circle-outline',
      label: 'Help & FAQ',
      subtitle: 'Frequently asked questions',
      onPress: () => router.push('/(customer)/faq')
    },
    {
      id: 'terms',
      icon: 'document-text-outline',
      label: 'Terms & Conditions',
      subtitle: 'Our policies',
      onPress: () => router.push('/(customer)/terms')
    },
    {
      id: 'privacy',
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      subtitle: 'How we protect your data',
      onPress: () => router.push('/(customer)/privacy')
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Login to access your profile'}</Text>
          {user?.phone && <Text style={styles.userPhone}>📞 {user?.phone}</Text>}

          {user && (
            <TouchableOpacity 
              style={styles.editProfileBtn}
              onPress={() => router.push('/(customer)/editProfile')}
            >
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats Row */}
        {user && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{stats?.order_count || 0}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>₹{stats?.total_spent || 0}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={22} color="#166534" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        {user ? (
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => {
              logout();
              router.replace('/(auth)/login');
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.logoutBtn, { borderColor: '#166534', backgroundColor: '#dcfce7' }]}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#166534" />
            <Text style={[styles.logoutText, { color: '#166534' }]}>Log In</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.sm,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0f172a',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    ...typography.h2,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userPhone: {
    ...typography.caption,
    marginBottom: Spacing.md,
  },
  editProfileBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileBtnText: {
    ...typography.label,
    color: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    ...shadows.sm,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  menuSubtitle: {
    ...typography.caption,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    marginHorizontal: Spacing.md,
    marginBottom: 40,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  }
});
