import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, shadows, typography } from '../../src/constants/theme';
import { useRouter } from 'expo-router';

const categories = [
  { id: 'fish', name: 'Fish', emoji: '🐟', color: '#dbeafe' },
  { id: 'prawns-shrimp', name: 'Prawns & Shrimp', emoji: '🦐', color: '#dcfce7' },
  { id: 'crabs', name: 'Crabs', emoji: '🦀', color: '#fee2e2' },
  { id: 'lobster', name: 'Lobster', emoji: '🦞', color: '#fef3c7' },
  { id: 'dried-fish', name: 'Dried Fish', emoji: '🐠', color: '#f3e8ff' },
  { id: 'combos', name: 'Combos', emoji: '🎁', color: '#fce7f3' },
];

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Categories</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.card, { backgroundColor: cat.color }]}
              onPress={() => router.push({ 
                pathname: '/(customer)/categoryProducts', 
                params: { category: cat.id, categoryName: cat.name, emoji: cat.emoji } 
              })}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={styles.name}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...typography.h1,
    fontSize: 24,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...shadows.sm,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  name: {
    ...typography.h3,
    textAlign: 'center',
  },
});
