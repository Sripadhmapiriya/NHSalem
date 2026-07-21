import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, typography, shadows } from '../../src/constants/theme';

export default function AddressesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.addressCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Home</Text>
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
            </View>
          </View>
          <Text style={styles.addressText}>123 Seafood Lane, Marina District</Text>
          <Text style={styles.addressText}>Salem, Tamil Nadu 636001</Text>
          <Text style={styles.addressText}>Phone: +91 9000000000</Text>
          <View style={styles.actions}>
            <TouchableOpacity><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.actionTextRed}>Delete</Text></TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: { padding: Spacing.md },
  addressCard: {
    backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: 12,
    marginBottom: Spacing.md, ...shadows.sm, borderWidth: 1, borderColor: '#bfdbfe'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardTitle: { ...typography.h3, fontSize: 16 },
  defaultBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  defaultBadgeText: { color: '#1d4ed8', fontSize: 10, fontWeight: '700' },
  addressText: { ...typography.body, color: Colors.textSecondary, marginBottom: 4 },
  actions: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.lg },
  actionText: { color: '#166534', fontWeight: '600' },
  actionTextRed: { color: '#ef4444', fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#166534', paddingVertical: 14, borderRadius: 12, marginTop: Spacing.md
  },
  addBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
});
