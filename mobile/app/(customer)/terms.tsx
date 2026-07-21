import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, typography } from '../../src/constants/theme';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>Last Updated: October 2024</Text>
        <Text style={styles.text}>
          Welcome to NH Salem Sea Foods. By using our application, you agree to these terms and conditions.
          {'\n\n'}
          1. Use of Service
          {'\n'}
          We provide fresh seafood delivery services in and around Salem.
          {'\n\n'}
          2. Orders and Payment
          {'\n'}
          All orders are subject to availability. Prices may change according to market rates.
          {'\n\n'}
          3. Delivery
          {'\n'}
          We aim to deliver within the selected time slot, but unforeseen circumstances may cause delays.
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
