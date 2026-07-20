import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '../src/api/client';
import ProductCard from '../src/components/ProductCard';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/api/products?search=${query}`);
        setResults(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for fresh seafood..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : query.length > 0 && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noResultsTitle}>No results found</Text>
          <Text style={styles.noResultsSub}>Try searching for "Fish" or "Crab"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
             <View style={styles.gridItem}>
              <ProductCard 
                product={item} 
                onPress={() => router.push(`/(customer)/product/${item.slug || item.id}`)} 
              />
            </View>
          )}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { marginRight: Spacing.md },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: 16, color: Colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noResultsTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: Spacing.xs },
  noResultsSub: { fontSize: 14, color: Colors.textSecondary },
  listContainer: { padding: Spacing.xs },
  gridItem: { width: '50%', padding: Spacing.xs },
});
