import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, typography } from '../../src/constants/theme';

export default function FAQScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.question}>How fresh is the seafood?</Text>
          <Text style={styles.answer}>We deliver seafood caught on the same day. It's packed on ice and delivered within hours of reaching the shore.</Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>Do you clean and cut the fish?</Text>
          <Text style={styles.answer}>Yes! We clean, descale, and cut the fish according to your preference before delivery.</Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.question}>What are your delivery timings?</Text>
          <Text style={styles.answer}>We offer multiple delivery slots throughout the day. You can select your preferred slot during checkout.</Text>
        </View>
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
  title: { ...typography.h2, marginBottom: Spacing.lg },
  faqItem: {
    backgroundColor: Colors.surface, padding: Spacing.lg,
    borderRadius: 12, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border
  },
  question: { ...typography.h3, fontSize: 16, marginBottom: Spacing.sm },
  answer: { ...typography.body, color: Colors.textSecondary },
});
