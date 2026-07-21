import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, typography } from '../../src/constants/theme';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>Last Updated: October 2024</Text>
        <Text style={styles.text}>
          We value your privacy. This policy outlines how we handle your personal data.
          {'\n\n'}
          1. Information Collection
          {'\n'}
          We collect information necessary for order fulfillment, including name, address, and phone number.
          {'\n\n'}
          2. Data Security
          {'\n'}
          We use industry-standard security measures to protect your data.
          {'\n\n'}
          3. Third-party Sharing
          {'\n'}
          We do not share your data with third parties except for essential services like payment processing and delivery.
        </Text>
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
  content: { padding: Spacing.lg },
  date: { ...typography.caption, marginBottom: Spacing.md },
  text: { ...typography.body, lineHeight: 24 },
});
