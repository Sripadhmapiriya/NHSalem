import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../src/constants/theme';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  { id: 'fish', name: 'Fish', emoji: '🐟', count: 12 },
  { id: 'prawns', name: 'Prawns', emoji: '🦐', count: 8 },
  { id: 'crabs', name: 'Crabs', emoji: '🦀', count: 5 },
  { id: 'lobster', name: 'Lobster', emoji: '🦞', count: 2 },
  { id: 'dried-fish', name: 'Dried Fish', emoji: '🐠', count: 6 },
  { id: 'combos', name: 'Combos', emoji: '🎁', count: 3 },
];

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.card}
              onPress={() => router.push({ pathname: '/(customer)/category-products', params: { category: cat.id, name: cat.name } })}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={styles.name}>{cat.name}</Text>
              <Text style={styles.count}>{cat.count} Products</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
